from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ServiceProviderViewSet, ServiceRequestViewSet

router = DefaultRouter()
router.register(r'profiles', ServiceProviderViewSet, basename='provider')
router.register(r'requests', ServiceRequestViewSet, basename='request')

urlpatterns = [
    path('', include(router.urls)),
]
