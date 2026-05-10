from rest_framework import viewsets, permissions
from .models import DeliveryPartner, Restaurant, PropertyDeliveryMap
from .serializers import DeliveryPartnerSerializer, RestaurantSerializer, PropertyDeliveryMapSerializer

class DeliveryPartnerViewSet(viewsets.ReadOnlyModelViewSet):
    """List available delivery partners. Can filter by country."""
    queryset = DeliveryPartner.objects.filter(status=True)
    serializer_class = DeliveryPartnerSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        country = self.request.query_params.get('country')
        if country:
            qs = qs.filter(country__iexact=country)
        return qs

class RestaurantViewSet(viewsets.ReadOnlyModelViewSet):
    """List available restaurants. Can filter by location."""
    queryset = Restaurant.objects.filter(delivery_available=True).order_by('-is_sponsored', '-rating')
    serializer_class = RestaurantSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        location = self.request.query_params.get('location')
        if location:
            qs = qs.filter(location__icontains=location)
        return qs

class PropertyDeliveryMapViewSet(viewsets.ReadOnlyModelViewSet):
    """Get contextual delivery options for a specific property."""
    queryset = PropertyDeliveryMap.objects.filter(availability=True)
    serializer_class = PropertyDeliveryMapSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        property_id = self.request.query_params.get('property')
        if property_id:
            qs = qs.filter(property_id=property_id)
        return qs
