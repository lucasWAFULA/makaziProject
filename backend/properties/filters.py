from django_filters import rest_framework as filters
from django.db.models import Q
from .models import Property


class PropertyFilter(filters.FilterSet):
    # ── Location filters ────────────────────────────────────────────────────
    location = filters.CharFilter(lookup_expr="icontains")
    country = filters.CharFilter(field_name="country", lookup_expr="icontains")
    region = filters.CharFilter(field_name="region", lookup_expr="icontains")
    town = filters.CharFilter(field_name="town", lookup_expr="icontains")
    destination_id = filters.NumberFilter(field_name="destination_id")
    destination_slug = filters.CharFilter(field_name="destination__destination_slug")
    tourism_category = filters.CharFilter(
        field_name="destination__tourism_category", lookup_expr="iexact"
    )

    # ── Taxonomy filters ────────────────────────────────────────────────────
    category = filters.CharFilter(field_name="category__slug")
    category_id = filters.NumberFilter(field_name="category_id")
    property_type = filters.CharFilter(field_name="property_type__slug")
    property_type_id = filters.NumberFilter(field_name="property_type_id")

    # ── Legacy ──────────────────────────────────────────────────────────────
    listing_type = filters.CharFilter(field_name="listing_type")
    catalog_slug = filters.CharFilter(field_name="catalog_slug")

    # ── Configuration filters ───────────────────────────────────────────────
    bedrooms = filters.NumberFilter(field_name="bedrooms")
    bedrooms_min = filters.NumberFilter(field_name="bedrooms", lookup_expr="gte")
    bedrooms_max = filters.NumberFilter(field_name="bedrooms", lookup_expr="lte")
    bathrooms = filters.NumberFilter(field_name="bathrooms")
    beds_min = filters.NumberFilter(field_name="beds", lookup_expr="gte")
    guests = filters.NumberFilter(field_name="max_guests", lookup_expr="gte")

    # ── Price filters ───────────────────────────────────────────────────────
    price_min = filters.NumberFilter(field_name="price_per_night", lookup_expr="gte")
    price_max = filters.NumberFilter(field_name="price_per_night", lookup_expr="lte")
    price_tier = filters.CharFilter(method="filter_price_tier")

    # ── Classification filters ──────────────────────────────────────────────
    stay_style = filters.CharFilter(field_name="stay_style")

    # ── Feature filters (multi-value) ───────────────────────────────────────
    feature = filters.CharFilter(method="filter_feature")
    feature_group = filters.CharFilter(method="filter_feature_group")

    # ── Legacy text-search filters ──────────────────────────────────────────
    experience = filters.CharFilter(method="filter_experience")
    amenity = filters.CharFilter(method="filter_amenity")

    # ── Featured ────────────────────────────────────────────────────────────
    is_featured = filters.BooleanFilter(field_name="is_featured")

    def filter_price_tier(self, queryset, name, value):
        tier = (value or "").lower()
        # First check stored price_tier field
        if queryset.filter(price_tier=tier).exists():
            return queryset.filter(price_tier=tier)
        # Fall back to computed range
        if tier == "budget":
            return queryset.filter(price_per_night__lte=80000)
        if tier == "standard":
            return queryset.filter(price_per_night__gt=80000, price_per_night__lte=180000)
        if tier == "premium":
            return queryset.filter(price_per_night__gt=180000, price_per_night__lte=350000)
        if tier == "luxury":
            return queryset.filter(price_per_night__gt=350000, price_per_night__lte=800000)
        if tier == "ultra_luxury":
            return queryset.filter(price_per_night__gt=800000)
        return queryset

    def filter_feature(self, queryset, name, value):
        """Filter by feature slug (supports comma-separated multi-values)"""
        slugs = [s.strip() for s in value.split(",") if s.strip()]
        if not slugs:
            return queryset
        for slug in slugs:
            queryset = queryset.filter(features__slug=slug)
        return queryset

    def filter_feature_group(self, queryset, name, value):
        """Filter properties that have at least one feature in the given group"""
        group = (value or "").lower()
        if not group:
            return queryset
        return queryset.filter(features__feature_group=group).distinct()

    def filter_experience(self, queryset, name, value):
        """Legacy experience filter — maps to text search terms"""
        experience = (value or "").lower().replace("-", "_")
        text_filter = Q()
        terms_map = {
            "beachfront": ["beach", "ocean", "sea", "nungwi", "kendwa", "paje", "diani", "jambiani"],
            "work_friendly": ["wifi", "work", "desk", "business", "masaki", "oyster", "dar"],
            "family_friendly": ["family", "quiet", "secure", "children"],
            "city_convenience": ["city", "mall", "nightlife", "transport", "masaki", "oyster", "dar"],
            "luxury": ["villa", "luxury", "premium", "concierge", "housekeeping"],
        }
        terms = terms_map.get(experience)
        if not terms:
            return queryset
        for term in terms:
            text_filter |= (
                Q(title_sw__icontains=term)
                | Q(description_sw__icontains=term)
                | Q(location__icontains=term)
                | Q(country__icontains=term)
                | Q(region__icontains=term)
                | Q(town__icontains=term)
                | Q(listing_type__icontains=term)
                | Q(catalog_slug__icontains=term)
                | Q(amenities__icontains=term)
            )
        return queryset.filter(text_filter)

    def filter_amenity(self, queryset, name, value):
        """Legacy JSON amenity text search"""
        amenity = (value or "").lower()
        if not amenity:
            return queryset
        return queryset.filter(amenities__icontains=amenity)

    class Meta:
        model = Property
        fields = [
            "location", "country", "region", "town",
            "destination_id", "destination_slug", "tourism_category",
            "category", "category_id", "property_type", "property_type_id",
            "listing_type", "catalog_slug",
            "bedrooms", "bedrooms_min", "bedrooms_max", "bathrooms", "beds_min", "guests",
            "price_min", "price_max", "price_tier",
            "stay_style", "feature", "feature_group",
            "experience", "amenity",
            "is_featured",
        ]
