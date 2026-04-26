from rest_framework import serializers

from .models import TaxiBooking, DriverProfile, TransportRoute, TransportPartner


class DriverProfileSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()

    class Meta:
        model = DriverProfile
        fields = ("id", "user", "vehicle_type", "plate_number", "is_verified", "is_available", "rating")

    def get_user(self, obj):
        return {
            "id": obj.user_id,
            "username": obj.user.username,
            "email": obj.user.email,
            "phone_number": obj.user.phone_number,
        }


class TaxiBookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaxiBooking
        fields = (
            "id",
            "pickup",
            "destination",
            "travel_date",
            "pickup_time",
            "passengers",
            "phone_number",
            "notes",
            "vehicle_type",
            "return_trip",
            "estimated_price",
            "driver",
            "status",
            "created_at",
        )
        read_only_fields = ("status", "created_at", "driver")

    def validate_passengers(self, value):
        if value < 1 or value > 20:
            raise serializers.ValidationError("Passengers must be between 1 and 20.")
        return value


class TransportRouteSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransportRoute
        fields = (
            "id",
            "country",
            "route_category",
            "origin",
            "destination",
            "transport_type",
            "estimated_time",
            "price_min",
            "price_max",
            "currency",
            "notes",
            "is_featured",
        )


class TransportPartnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransportPartner
        fields = (
            "id",
            "name",
            "region",
            "city",
            "service_type",
            "logo_url",
            "booking_url",
            "whatsapp_number",
            "description",
            "is_external",
            "is_featured",
            "priority",
        )
