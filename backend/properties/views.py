from django.shortcuts import get_object_or_404
from rest_framework import generics, serializers as drf_serializers, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter

from .models import Property, PropertyImage, PropertyVideo, PropertyCategory, PropertyFeature
from .serializers import (
    PropertyListSerializer, PropertyDetailSerializer,
    PropertyWriteSerializer, PropertyImageSerializer,
    PropertyCategorySerializer, PropertyFeatureSerializer,
)
from .filters import PropertyFilter


# ── Catalogue endpoints ────────────────────────────────────────────────────────

class PropertyCategoryListView(generics.ListAPIView):
    queryset = (
        PropertyCategory.objects
        .filter(is_active=True)
        .prefetch_related("types")
        .order_by("order", "name")
    )
    serializer_class = PropertyCategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class PropertyFeatureListView(generics.ListAPIView):
    queryset = (
        PropertyFeature.objects
        .filter(is_active=True)
        .order_by("feature_group", "order", "name")
    )
    serializer_class = PropertyFeatureSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        group = self.request.query_params.get("group")
        if group:
            qs = qs.filter(feature_group=group)
        return qs


# ── Property CRUD ──────────────────────────────────────────────────────────────

class PropertyListCreateView(generics.ListCreateAPIView):
    queryset = (
        Property.objects
        .filter(is_active=True, approval_status=Property.ApprovalStatus.APPROVED)
        .select_related("host", "destination", "category", "property_type")
        .prefetch_related("images", "features")
    )
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = PropertyFilter
    ordering_fields = ["price_per_night", "created_at", "bedrooms", "max_guests"]
    ordering = ["-created_at"]

    def get_serializer_class(self):
        return PropertyWriteSerializer if self.request.method == "POST" else PropertyListSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        if (
            self.request.user.is_authenticated
            and self.request.user.is_host
            and self.request.query_params.get("mine") == "1"
        ):
            return (
                Property.objects
                .filter(host=self.request.user)
                .select_related("host", "destination", "category", "property_type")
                .prefetch_related("images", "features")
            )
        return qs


class PropertyDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = (
        Property.objects
        .select_related("host", "destination", "category", "property_type")
        .prefetch_related("images", "features", "videos")
    )
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        return PropertyDetailSerializer if self.request.method == "GET" else PropertyWriteSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.method == "GET":
            user = self.request.user
            if user.is_authenticated and (user.is_staff or user.is_host):
                return qs
            return qs.filter(is_active=True, approval_status=Property.ApprovalStatus.APPROVED)
        return qs

    def perform_update(self, serializer):
        if serializer.instance.host_id != self.request.user.id and not self.request.user.is_staff:
            raise PermissionDenied()
        serializer.save()

    def perform_destroy(self, instance):
        if instance.host_id != self.request.user.id and not self.request.user.is_staff:
            raise PermissionDenied()
        instance.is_active = False
        instance.save()


# ── Property images ────────────────────────────────────────────────────────────

class PropertyImageView(APIView):
    """
    GET  /api/properties/<pk>/images/   — list images for a property
    POST /api/properties/<pk>/images/   — upload one or more images (multipart)
    """
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [IsAuthenticated]

    def _get_property(self, pk, user):
        prop = get_object_or_404(Property, pk=pk)
        if prop.host_id != user.id and not user.is_staff:
            raise PermissionDenied("You do not own this property.")
        return prop

    def get(self, request, property_pk):
        prop = get_object_or_404(Property, pk=property_pk)
        images = prop.images.order_by("order", "id")
        data = []
        for img in images:
            url = request.build_absolute_uri(img.image.url) if img.image else None
            data.append({"id": img.id, "url": url, "order": img.order})
        return Response(data)

    def post(self, request, property_pk):
        prop = self._get_property(property_pk, request.user)
        files = request.FILES.getlist("images") or (
            [request.FILES["image"]] if "image" in request.FILES else []
        )
        if not files:
            return Response({"detail": "No images provided."}, status=400)

        created = []
        base_order = prop.images.count()
        for idx, f in enumerate(files):
            img = PropertyImage.objects.create(property=prop, image=f, order=base_order + idx)
            created.append({
                "id": img.id,
                "url": request.build_absolute_uri(img.image.url),
                "order": img.order,
            })
        return Response(created, status=201)


class PropertyImageDetailView(APIView):
    """
    DELETE /api/properties/images/<pk>/          — delete an image
    PATCH  /api/properties/images/<pk>/          — update order
    """
    permission_classes = [IsAuthenticated]

    def _get_image(self, pk, user):
        img = get_object_or_404(PropertyImage, pk=pk)
        if img.property.host_id != user.id and not user.is_staff:
            raise PermissionDenied()
        return img

    def delete(self, request, pk):
        img = self._get_image(pk, request.user)
        try:
            img.image.delete(save=False)
        except Exception:
            pass
        img.delete()
        return Response(status=204)

    def patch(self, request, pk):
        img = self._get_image(pk, request.user)
        new_order = request.data.get("order")
        if new_order is not None:
            img.order = int(new_order)
            img.save(update_fields=["order"])
        return Response({"id": img.id, "order": img.order})


# ── Property videos ────────────────────────────────────────────────────────────

class PropertyVideoSerializer(drf_serializers.ModelSerializer):
    video_url = drf_serializers.SerializerMethodField()

    class Meta:
        model = PropertyVideo
        fields = ("id", "title", "video_url", "external_url", "order", "created_at")

    def get_video_url(self, obj):
        request = self.context.get("request")
        if obj.video and request:
            return request.build_absolute_uri(obj.video.url)
        return obj.external_url or None


class PropertyVideoView(APIView):
    """
    GET  /api/properties/<pk>/videos/   — list videos
    POST /api/properties/<pk>/videos/   — upload video file OR save external URL
    """
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    permission_classes = [IsAuthenticated]

    def _get_property(self, pk, user):
        prop = get_object_or_404(Property, pk=pk)
        if prop.host_id != user.id and not user.is_staff:
            raise PermissionDenied()
        return prop

    def get(self, request, property_pk):
        prop = get_object_or_404(Property, pk=property_pk)
        videos = prop.videos.order_by("order", "id")
        return Response(PropertyVideoSerializer(videos, many=True, context={"request": request}).data)

    def post(self, request, property_pk):
        prop = self._get_property(property_pk, request.user)
        video_file = request.FILES.get("video")
        external_url = request.data.get("external_url", "").strip()
        title = request.data.get("title", "").strip()

        if not video_file and not external_url:
            return Response({"detail": "Provide a video file or external_url."}, status=400)

        order = prop.videos.count()
        vid = PropertyVideo.objects.create(
            property=prop,
            title=title,
            order=order,
            **({"video": video_file} if video_file else {"external_url": external_url}),
        )
        return Response(
            PropertyVideoSerializer(vid, context={"request": request}).data,
            status=201,
        )


class PropertyVideoDetailView(APIView):
    """DELETE /api/properties/videos/<pk>/"""
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        vid = get_object_or_404(PropertyVideo, pk=pk)
        if vid.property.host_id != request.user.id and not request.user.is_staff:
            raise PermissionDenied()
        if vid.video:
            try:
                vid.video.delete(save=False)
            except Exception:
                pass
        vid.delete()
        return Response(status=204)

