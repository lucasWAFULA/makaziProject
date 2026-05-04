from django_filters import rest_framework as filters
from django.db.models import Q
from .models import Property


class PropertyFilter(filters.FilterSet):
    location = filters.CharFilter(lookup_expr="icontains")
    price_min = filters.NumberFilter(field_name="price_per_night", lookup_expr="gte")
    price_max = filters.NumberFilter(field_name="price_per_night", lookup_expr="lte")
    listing_type = filters.CharFilter(field_name="listing_type")
    catalog_slug = filters.CharFilter(field_name="catalog_slug")
    destination_id = filters.NumberFilter(field_name="destination_id")
    destination_slug = filters.CharFilter(field_name="destination__destination_slug")
    tourism_category = filters.CharFilter(field_name="destination__tourism_category", lookup_expr="iexact")
    country = filters.CharFilter(field_name="country", lookup_expr="icontains")
    region = filters.CharFilter(field_name="region", lookup_expr="icontains")
    town = filters.CharFilter(field_name="town", lookup_expr="icontains")
    price_tier = filters.CharFilter(method="filter_price_tier")
    experience = filters.CharFilter(method="filter_experience")
    amenity = filters.CharFilter(method="filter_amenity")

    def filter_price_tier(self, queryset, name, value):
        tier = (value or "").lower()
        if tier == "budget":
            return queryset.filter(price_per_night__lte=80000)
        if tier == "standard":
            return queryset.filter(price_per_night__gt=80000, price_per_night__lte=180000)
        if tier == "premium":
            return queryset.filter(price_per_night__gt=180000, price_per_night__lte=350000)
        if tier == "luxury":
            return queryset.filter(price_per_night__gt=350000)
        return queryset

    def filter_experience(self, queryset, name, value):
        experience = (value or "").lower().replace("-", "_")
        text_filter = Q()
        if experience == "beachfront":
            terms = ["beach", "ocean", "sea", "nungwi", "kendwa", "paje", "diani", "jambiani"]
        elif experience == "work_friendly":
            terms = ["wifi", "work", "desk", "business", "masaki", "oyster", "dar"]
        elif experience == "family_friendly":
            terms = ["family", "quiet", "secure", "children"]
        elif experience == "city_convenience":
            terms = ["city", "mall", "nightlife", "transport", "masaki", "oyster", "dar"]
        elif experience == "luxury":
            terms = ["villa", "luxury", "premium", "concierge", "housekeeping"]
        else:
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
        amenity = (value or "").lower()
        if not amenity:
            return queryset
        return queryset.filter(amenities__icontains=amenity)

    class Meta:
        model = Property
        fields = [
            "location",
            "price_min",
            "price_max",
            "listing_type",
            "catalog_slug",
            "destination_id",
            "destination_slug",
            "tourism_category",
            "country",
            "region",
            "town",
            "price_tier",
            "experience",
            "amenity",
        ]
