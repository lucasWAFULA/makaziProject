from rest_framework import serializers

from .models import Destination


class DestinationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Destination
        fields = (
            "destination_id",
            "country",
            "region",
            "destination_name",
            "destination_slug",
            "destination_type",
            "tourism_category",
            "is_featured",
            "is_active",
        )
