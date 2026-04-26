from django.shortcuts import get_object_or_404
from rest_framework import generics
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter

from .models import Property, PropertyImage
from .serializers import PropertyListSerializer, PropertyDetailSerializer, PropertyWriteSerializer, PropertyImageSerializer
from .filters import PropertyFilter


class PropertyListCreateView(generics.ListCreateAPIView):
    queryset = Property.objects.filter(
        is_active=True,
        approval_status=Property.ApprovalStatus.APPROVED,
    ).select_related("host", "destination").prefetch_related("images")
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = PropertyFilter
    ordering_fields = ["price_per_night", "created_at"]
    ordering = ["-created_at"]

    def get_serializer_class(self):
        return PropertyWriteSerializer if self.request.method == "POST" else PropertyListSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.user.is_authenticated and self.request.user.is_host and self.request.query_params.get("mine") == "1":
            return Property.objects.filter(host=self.request.user).select_related("host", "destination").prefetch_related("images")
        return qs


class PropertyDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Property.objects.select_related("host", "destination").prefetch_related("images")
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        return PropertyDetailSerializer if self.request.method == "GET" else PropertyWriteSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.method == "GET":
            user = self.request.user
            if user.is_authenticated and (user.is_staff or user.is_host):
                return qs
            return qs.filter(
                is_active=True,
                approval_status=Property.ApprovalStatus.APPROVED,
            )
        return qs

    def perform_update(self, serializer):
        if serializer.instance.host_id != self.request.user.id and not self.request.user.is_staff:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied()
        serializer.save()

    def perform_destroy(self, instance):
        if instance.host_id != self.request.user.id and not self.request.user.is_staff:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied()
        instance.is_active = False
        instance.save()


class PropertyImageView(generics.CreateAPIView):
    serializer_class = PropertyImageSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return PropertyImage.objects.filter(property_id=self.kwargs["property_pk"])

    def get_property(self):
        return get_object_or_404(Property, pk=self.kwargs["property_pk"])

    def perform_create(self, serializer):
        prop = self.get_property()
        if prop.host_id != self.request.user.id and not self.request.user.is_staff:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied()
        serializer.save(property=prop)
