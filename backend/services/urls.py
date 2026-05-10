from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DeliveryPartnerViewSet, RestaurantViewSet, PropertyDeliveryMapViewSet

router = DefaultRouter()
router.register(r'partners', DeliveryPartnerViewSet, basename='delivery-partner')
router.register(r'restaurants', RestaurantViewSet, basename='restaurant')
router.register(r'property-map', PropertyDeliveryMapViewSet, basename='property-delivery-map')

urlpatterns = [
    path('', include(router.urls)),
]
