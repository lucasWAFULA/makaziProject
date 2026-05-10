from rest_framework import serializers
from .models import Commission, Payment

class CommissionSerializer(serializers.ModelSerializer):
    property_title = serializers.CharField(source="property.title_sw", read_only=True)

    class Meta:
        model = Commission
        fields = (
            "id", "property", "property_title", "booking_value", "commission_rate",
            "commission_amount", "currency", "status", "due_date", "created_at"
        )
        read_only_fields = fields


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = (
            "id", "amount", "currency", "method", "reference_number", 
            "proof_image", "status", "created_at", "admin_notes"
        )
        read_only_fields = ("id", "status", "created_at", "admin_notes")

    def create(self, validated_data):
        validated_data['agent'] = self.context['request'].user
        return super().create(validated_data)
