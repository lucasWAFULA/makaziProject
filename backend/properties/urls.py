from django.urls import path
from .views import PropertyListCreateView, PropertyDetailView, PropertyImageView

urlpatterns = [
    path("", PropertyListCreateView.as_view(), name="property-list-create"),
    path("<int:pk>/", PropertyDetailView.as_view(), name="property-detail"),
    path("<int:property_pk>/images/", PropertyImageView.as_view(), name="property-images"),
]
