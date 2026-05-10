from django.urls import path
from .views import (
    PropertyListCreateView,
    PropertyDetailView,
    PropertyImageView,
    PropertyImageDetailView,
    PropertyVideoView,
    PropertyVideoDetailView,
    PropertyCategoryListView,
    PropertyFeatureListView,
)

urlpatterns = [
    # Catalogue (public)
    path("categories/", PropertyCategoryListView.as_view(), name="property-categories"),
    path("features/", PropertyFeatureListView.as_view(), name="property-features"),

    # Properties CRUD
    path("", PropertyListCreateView.as_view(), name="property-list-create"),
    path("<int:pk>/", PropertyDetailView.as_view(), name="property-detail"),

    # Images
    path("<int:property_pk>/images/", PropertyImageView.as_view(), name="property-images"),
    path("images/<int:pk>/", PropertyImageDetailView.as_view(), name="property-image-detail"),

    # Videos
    path("<int:property_pk>/videos/", PropertyVideoView.as_view(), name="property-videos"),
    path("videos/<int:pk>/", PropertyVideoDetailView.as_view(), name="property-video-detail"),
]
