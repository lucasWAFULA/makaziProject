from rest_framework import serializers
from .models import Property, PropertyImage
from destinations.models import Destination
from destinations.serializers import DestinationSerializer


def get_price_tier(price):
    amount = float(price or 0)
    if amount <= 80000:
        return "budget"
    if amount <= 180000:
        return "standard"
    if amount <= 350000:
        return "premium"
    return "luxury"


def get_search_text(obj):
    amenities = obj.amenities if isinstance(obj.amenities, list) else []
    return " ".join(
        str(value or "")
        for value in [
            obj.title_sw,
            obj.description_sw,
            obj.location,
            obj.country,
            obj.region,
            obj.town,
            obj.listing_type,
            obj.catalog_slug,
            " ".join(str(item) for item in amenities),
        ]
    ).lower()


def get_experience_tags(obj):
    text = get_search_text(obj)
    tags = [get_price_tier(obj.price_per_night)]
    if any(term in text for term in ["beach", "ocean", "sea", "nungwi", "kendwa", "paje", "diani", "jambiani"]):
        tags.append("beachfront")
    if any(term in text for term in ["wifi", "work", "desk", "business", "masaki", "oyster", "dar"]):
        tags.append("work_friendly")
    if any(term in text for term in ["family", "quiet", "secure", "children"]):
        tags.append("family_friendly")
    if any(term in text for term in ["villa", "luxury", "premium", "concierge", "housekeeping"]):
        tags.append("luxury")
    if any(term in text for term in ["city", "mall", "nightlife", "transport"]):
        tags.append("city_convenience")
    return list(dict.fromkeys(tags))


def get_amenity_groups(obj):
    text = get_search_text(obj)
    groups = []
    if any(term in text for term in ["wifi", "water", "security"]):
        groups.append("essential_comfort")
    if any(term in text for term in ["pool", "gym", "balcony", "ocean", "beach"]):
        groups.append("leisure")
    if any(term in text for term in ["parking", "kitchen", "laundry"]):
        groups.append("practical")
    if any(term in text for term in ["housekeeping", "concierge", "backup", "generator"]):
        groups.append("premium_extras")
    return groups


class PropertyImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyImage
        fields = ("id", "image", "order")


class PropertyListSerializer(serializers.ModelSerializer):
    first_image = serializers.SerializerMethodField()
    destination_detail = DestinationSerializer(source="destination", read_only=True)
    price_tier = serializers.SerializerMethodField()
    experience_tags = serializers.SerializerMethodField()
    amenity_groups = serializers.SerializerMethodField()

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
            "price_tier",
            "experience_tags",
            "amenity_groups",
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

    def get_price_tier(self, obj):
        return get_price_tier(obj.price_per_night)

    def get_experience_tags(self, obj):
        return get_experience_tags(obj)

    def get_amenity_groups(self, obj):
        return get_amenity_groups(obj)


class PropertyDetailSerializer(serializers.ModelSerializer):
    images = PropertyImageSerializer(many=True, read_only=True)
    image_urls = serializers.SerializerMethodField()
    destination_detail = DestinationSerializer(source="destination", read_only=True)
    price_tier = serializers.SerializerMethodField()
    experience_tags = serializers.SerializerMethodField()
    amenity_groups = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = (
            "id", "host", "title_sw", "description_sw", "location", "destination", "destination_detail",
            "country", "region", "town", "listing_type", "catalog_slug",
            "price_per_night", "price_tier", "experience_tags", "amenity_groups",
            "rules_sw", "amenities", "is_active", "approval_status", "images", "image_urls",
            "created_at", "updated_at",
        )

    def get_image_urls(self, obj):
        request = self.context.get("request")
        return [
            request.build_absolute_uri(img.image.url) if request else img.image.url
            for img in obj.images.order_by("order", "id")
            if img.image
        ]

    def get_price_tier(self, obj):
        return get_price_tier(obj.price_per_night)

    def get_experience_tags(self, obj):
        return get_experience_tags(obj)

    def get_amenity_groups(self, obj):
        return get_amenity_groups(obj)


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
