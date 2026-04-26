from django_filters import rest_framework as filters
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
        ]
