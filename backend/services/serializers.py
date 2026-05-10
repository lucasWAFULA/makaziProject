from rest_framework import serializers
from .models import DeliveryPartner, Restaurant, PropertyDeliveryMap

class DeliveryPartnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryPartner
        fields = ('id', 'name', 'country', 'category', 'logo_url', 'referral_link')

class RestaurantSerializer(serializers.ModelSerializer):
    partner_name = serializers.CharField(source='partner.name', read_only=True)
    
    class Meta:
        model = Restaurant
        fields = ('id', 'name', 'location', 'delivery_available', 'partner_name', 'rating', 'is_sponsored', 'whatsapp_number')

class PropertyDeliveryMapSerializer(serializers.ModelSerializer):
    partner = DeliveryPartnerSerializer(read_only=True)
    restaurant = RestaurantSerializer(read_only=True)

    class Meta:
        model = PropertyDeliveryMap
        fields = ('id', 'property', 'partner', 'restaurant', 'availability')
