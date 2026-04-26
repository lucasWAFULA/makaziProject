from rest_framework import serializers
from .models import Booking, Availability
from properties.serializers import PropertyListSerializer


class AvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Availability
        fields = ("id", "date", "is_available")


class BookingSerializer(serializers.ModelSerializer):
    property_detail = PropertyListSerializer(source="property", read_only=True)

    class Meta:
        model = Booking
        fields = (
            "id", "user", "property", "property_detail",
            "check_in", "check_out", "total_price", "booking_reference", "status",
            "payment_reference", "cancelled_at", "cancellation_reason",
            "created_at",
        )
        read_only_fields = (
            "user",
            "total_price",
            "booking_reference",
            "status",
            "payment_reference",
            "cancelled_at",
            "cancellation_reason",
            "created_at",
        )

    def validate(self, attrs):
        check_in = attrs.get("check_in")
        check_out = attrs.get("check_out")
        if check_in and check_out:
            if check_out <= check_in:
                raise serializers.ValidationError({"check_out": "Check-out must be after check-in."})
        return attrs


class BookingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ("property", "check_in", "check_out")

    def validate(self, attrs):
        check_in = attrs["check_in"]
        check_out = attrs["check_out"]
        if check_out <= check_in:
            raise serializers.ValidationError({"check_out": "Check-out must be after check-in."})
        return attrs
