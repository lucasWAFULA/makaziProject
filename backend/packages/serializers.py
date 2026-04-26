from rest_framework import serializers

from .models import TravelPackage


class TravelPackageSerializer(serializers.ModelSerializer):
    class Meta:
        model = TravelPackage
        fields = (
            "id",
            "name",
            "slug",
            "package_type",
            "description",
            "duration_label",
            "price_from",
            "includes",
            "transport_included",
            "meals_included",
            "is_active",
        )
