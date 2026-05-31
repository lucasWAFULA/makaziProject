from rest_framework import serializers
from .models import ServiceProvider, ServiceRequest

class ServiceProviderSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceProvider
        fields = [
            'id', 'provider_type', 'business_name', 'contact_phone', 
            'location', 'is_verified', 'status', 'id_document', 
            'business_document', 'created_at', 'updated_at'
        ]
        read_only_fields = ['is_verified', 'status', 'created_at', 'updated_at']

    def create(self, validated_data):
        # The user is injected from the view's perform_create
        return super().create(validated_data)

class ServiceRequestSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.get_full_name', read_only=True)
    customer_email = serializers.CharField(source='customer.email', read_only=True)
    provider_name = serializers.CharField(source='provider.business_name', read_only=True)

    class Meta:
        model = ServiceRequest
        fields = [
            'id', 'customer', 'customer_name', 'customer_email',
            'provider', 'provider_name', 'service_type', 'details',
            'status', 'price', 'created_at', 'updated_at'
        ]
        read_only_fields = ['customer', 'created_at', 'updated_at']
