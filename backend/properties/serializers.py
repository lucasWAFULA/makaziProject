from rest_framework import serializers
from .models import Property, PropertyImage, PropertyCategory, PropertyType, PropertyFeature
from destinations.models import Destination
from destinations.serializers import DestinationSerializer


# ── Helpers ───────────────────────────────────────────────────────────────────

def get_price_tier(price):
    amount = float(price or 0)
    if amount <= 80000:
        return "budget"
    if amount <= 180000:
        return "standard"
    if amount <= 350000:
        return "premium"
    if amount <= 800000:
        return "luxury"
    return "ultra_luxury"


def get_search_text(obj):
    amenities = obj.amenities if isinstance(obj.amenities, list) else []
    return " ".join(
        str(value or "")
        for value in [
            obj.title_sw, obj.description_sw, obj.location,
            obj.country, obj.region, obj.town,
            obj.listing_type, obj.catalog_slug,
            " ".join(str(item) for item in amenities),
        ]
    ).lower()


def get_experience_tags(obj):
    text = get_search_text(obj)
    tags = [obj.price_tier or get_price_tier(obj.price_per_night)]
    if any(t in text for t in ["beach", "ocean", "sea", "nungwi", "kendwa", "paje", "diani", "jambiani"]):
        tags.append("beachfront")
    if any(t in text for t in ["wifi", "work", "desk", "business", "masaki", "oyster", "dar"]):
        tags.append("work_friendly")
    if any(t in text for t in ["family", "quiet", "secure", "children"]):
        tags.append("family_friendly")
    if any(t in text for t in ["villa", "luxury", "premium", "concierge", "housekeeping"]):
        tags.append("luxury")
    if any(t in text for t in ["city", "mall", "nightlife", "transport"]):
        tags.append("city_convenience")
    return list(dict.fromkeys(tags))


def get_amenity_groups(obj):
    text = get_search_text(obj)
    groups = []
    if any(t in text for t in ["wifi", "water", "security"]):
        groups.append("essential_comfort")
    if any(t in text for t in ["pool", "gym", "balcony", "ocean", "beach"]):
        groups.append("leisure")
    if any(t in text for t in ["parking", "kitchen", "laundry"]):
        groups.append("practical")
    if any(t in text for t in ["housekeeping", "concierge", "backup", "generator"]):
        groups.append("premium_extras")
    return groups


# ── Catalogue serializers ──────────────────────────────────────────────────────

class PropertyFeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyFeature
        fields = ("id", "name", "slug", "feature_group", "icon")


class PropertyTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyType
        fields = ("id", "name", "slug", "order")


class PropertyCategorySerializer(serializers.ModelSerializer):
    types = PropertyTypeSerializer(many=True, read_only=True)

    class Meta:
        model = PropertyCategory
        fields = ("id", "name", "slug", "icon", "description", "order", "types")


# ── Image serializer ───────────────────────────────────────────────────────────

class PropertyImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyImage
        fields = ("id", "image", "order")


# ── List serializer ────────────────────────────────────────────────────────────

class PropertyListSerializer(serializers.ModelSerializer):
    first_image = serializers.SerializerMethodField()
    destination_detail = DestinationSerializer(source="destination", read_only=True)
    category_detail = PropertyCategorySerializer(source="category", read_only=True)
    type_detail = PropertyTypeSerializer(source="property_type", read_only=True)
    features = PropertyFeatureSerializer(many=True, read_only=True)
    price_tier = serializers.SerializerMethodField()
    experience_tags = serializers.SerializerMethodField()
    amenity_groups = serializers.SerializerMethodField()
    capacity_label = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = (
            "id", "slug", "title_sw", "location",
            "destination", "destination_detail",
            "country", "region", "town",
            "category", "category_detail",
            "property_type", "type_detail",
            "listing_type", "catalog_slug",
            "features",
            "bedrooms", "beds", "bathrooms", "max_guests",
            "price_per_night", "base_currency", "price_tier",
            "stay_style", "capacity_label",
            "experience_tags", "amenity_groups",
            "first_image", "is_featured",
            "is_active", "approval_status", "verification_tier",
        )

    def get_first_image(self, obj):
        img = obj.images.order_by("order", "id").first()
        if img and img.image:
            request = self.context.get("request")
            return request.build_absolute_uri(img.image.url) if request else img.image.url
        return None

    def get_price_tier(self, obj):
        return obj.price_tier or get_price_tier(obj.price_per_night)

    def get_experience_tags(self, obj):
        return get_experience_tags(obj)

    def get_amenity_groups(self, obj):
        return get_amenity_groups(obj)

    def get_capacity_label(self, obj):
        parts = []
        if obj.max_guests:
            parts.append(f"Sleeps {obj.max_guests}")
        if obj.bedrooms:
            parts.append(f"{obj.bedrooms} BR")
        if obj.bathrooms:
            parts.append(f"{obj.bathrooms} BA")
        return " · ".join(parts) if parts else None


# ── Detail serializer ──────────────────────────────────────────────────────────

class PropertyDetailSerializer(serializers.ModelSerializer):
    images = PropertyImageSerializer(many=True, read_only=True)
    image_urls = serializers.SerializerMethodField()
    destination_detail = DestinationSerializer(source="destination", read_only=True)
    category_detail = PropertyCategorySerializer(source="category", read_only=True)
    type_detail = PropertyTypeSerializer(source="property_type", read_only=True)
    features = PropertyFeatureSerializer(many=True, read_only=True)
    price_tier = serializers.SerializerMethodField()
    experience_tags = serializers.SerializerMethodField()
    amenity_groups = serializers.SerializerMethodField()
    capacity_label = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = (
            "id", "slug", "host", "title_sw", "description_sw",
            "location", "destination", "destination_detail",
            "country", "region", "town",
            "category", "category_detail",
            "property_type", "type_detail",
            "listing_type", "catalog_slug",
            "features",
            "bedrooms", "beds", "bathrooms", "max_guests",
            "floor_count", "room_size_sqm",
            "price_per_night", "base_currency", "price_tier",
            "stay_style", "capacity_label",
            "experience_tags", "amenity_groups",
            "rules_sw", "amenities",
            "is_active", "is_featured", "approval_status",
            "images", "image_urls",
            "verification_tier",
            "latitude", "longitude", "landmark",
            "walkthrough_video_url",
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
        return obj.price_tier or get_price_tier(obj.price_per_night)

    def get_experience_tags(self, obj):
        return get_experience_tags(obj)

    def get_amenity_groups(self, obj):
        return get_amenity_groups(obj)

    def get_capacity_label(self, obj):
        parts = []
        if obj.max_guests:
            parts.append(f"Sleeps {obj.max_guests}")
        if obj.bedrooms:
            parts.append(f"{obj.bedrooms} BR")
        if obj.bathrooms:
            parts.append(f"{obj.bathrooms} BA")
        return " · ".join(parts) if parts else None


# ── Write serializer ───────────────────────────────────────────────────────────

class PropertyWriteSerializer(serializers.ModelSerializer):
    destination = serializers.PrimaryKeyRelatedField(
        queryset=Destination.objects.filter(is_active=True), required=False, allow_null=True
    )
    category = serializers.PrimaryKeyRelatedField(
        queryset=PropertyCategory.objects.filter(is_active=True), required=False, allow_null=True
    )
    property_type = serializers.PrimaryKeyRelatedField(
        queryset=PropertyType.objects.filter(is_active=True), required=False, allow_null=True
    )
    features = serializers.PrimaryKeyRelatedField(
        queryset=PropertyFeature.objects.filter(is_active=True),
        many=True, required=False
    )

    class Meta:
        model = Property
        fields = (
            "title_sw", "description_sw",
            "location", "destination",
            "country", "region", "town",
            "category", "property_type", "features",
            "listing_type", "catalog_slug",
            "bedrooms", "beds", "bathrooms", "max_guests",
            "floor_count", "room_size_sqm",
            "price_per_night", "base_currency", "price_tier", "stay_style",
            "rules_sw", "amenities",
            "is_active",
            "latitude", "longitude", "landmark",
            "contact_name", "contact_phone",
            "ownership_details", "walkthrough_video_url",
        )

    def create(self, validated_data):
        user = self.context["request"].user
        if not user.is_host:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only hosts can create properties.")
        features = validated_data.pop("features", [])
        validated_data["host"] = user
        validated_data["approval_status"] = Property.ApprovalStatus.PENDING
        destination = validated_data.get("destination")
        if destination:
            validated_data.setdefault("country", destination.country)
            validated_data.setdefault("region", destination.region)
            validated_data.setdefault("town", destination.destination_name)
        instance = super().create(validated_data)
        if features:
            instance.features.set(features)
        return instance

    def update(self, instance, validated_data):
        features = validated_data.pop("features", None)
        destination = validated_data.get("destination")
        if destination:
            validated_data.setdefault("country", destination.country)
            validated_data.setdefault("region", destination.region)
            validated_data.setdefault("town", destination.destination_name)
        instance = super().update(instance, validated_data)
        if features is not None:
            instance.features.set(features)
        return instance
