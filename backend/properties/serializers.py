from rest_framework import serializers
from .models import Property, PropertyImage
from destinations.models import Destination
from destinations.serializers import DestinationSerializer


class PropertyImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyImage
        fields = ("id", "image", "order")


class PropertyListSerializer(serializers.ModelSerializer):
    first_image = serializers.SerializerMethodField()
    destination_detail = DestinationSerializer(source="destination", read_only=True)

    class Meta:
        model = Property
        fields = (
            "id",
            "title_sw",
            "location",
            "destination",
            "destination_detail",
            "country",
            "region",
            "town",
            "listing_type",
            "catalog_slug",
            "price_per_night",
            "first_image",
            "is_active",
            "approval_status",
        )

    def get_first_image(self, obj):
        img = obj.images.order_by("order", "id").first()
        if img and img.image:
            request = self.context.get("request")
            return request.build_absolute_uri(img.image.url) if request else img.image.url
        return None


class PropertyDetailSerializer(serializers.ModelSerializer):
    images = PropertyImageSerializer(many=True, read_only=True)
    image_urls = serializers.SerializerMethodField()
    destination_detail = DestinationSerializer(source="destination", read_only=True)

    class Meta:
        model = Property
        fields = (
            "id", "host", "title_sw", "description_sw", "location", "destination", "destination_detail",
            "country", "region", "town", "listing_type", "catalog_slug",
            "price_per_night", "rules_sw", "amenities", "is_active", "approval_status", "images", "image_urls",
            "created_at", "updated_at",
        )

    def get_image_urls(self, obj):
        request = self.context.get("request")
        return [
            request.build_absolute_uri(img.image.url) if request else img.image.url
            for img in obj.images.order_by("order", "id")
            if img.image
        ]


class PropertyWriteSerializer(serializers.ModelSerializer):
    destination = serializers.PrimaryKeyRelatedField(queryset=Destination.objects.filter(is_active=True), required=False, allow_null=True)

    class Meta:
        model = Property
        fields = (
            "title_sw",
            "description_sw",
            "location",
            "destination",
            "country",
            "region",
            "town",
            "listing_type",
            "catalog_slug",
            "price_per_night",
            "rules_sw",
            "amenities",
            "is_active",
        )

    def create(self, validated_data):
        user = self.context["request"].user
        if not user.is_host:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only hosts can create properties.")
        validated_data["host"] = user
        validated_data["approval_status"] = Property.ApprovalStatus.PENDING
        destination = validated_data.get("destination")
        if destination:
            validated_data.setdefault("country", destination.country)
            validated_data.setdefault("region", destination.region)
            validated_data.setdefault("town", destination.destination_name)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        destination = validated_data.get("destination")
        if destination:
            validated_data.setdefault("country", destination.country)
            validated_data.setdefault("region", destination.region)
            validated_data.setdefault("town", destination.destination_name)
        return super().update(instance, validated_data)
