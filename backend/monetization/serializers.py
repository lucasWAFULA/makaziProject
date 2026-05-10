from rest_framework import serializers
from .models import TransportPartner, AdPlacement, FeaturedListing


class TransportPartnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransportPartner
        fields = (
            "id", "name", "slug", "partner_type",
            "countries", "icon", "logo_url", "color",
            "referral_url", "tagline", "order",
        )


class AdPlacementSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdPlacement
        fields = (
            "id", "slot", "title", "subtitle",
            "cta_label", "cta_url", "image_url",
            "background_color",
        )


class FeaturedListingSerializer(serializers.ModelSerializer):
    property_id = serializers.IntegerField(source="property.id")
    property_title = serializers.CharField(source="property.title_sw")
    property_location = serializers.CharField(source="property.location")

    class Meta:
        model = FeaturedListing
        fields = (
            "id", "tier", "property_id",
            "property_title", "property_location",
        )
