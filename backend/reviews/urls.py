from django.urls import path
from .views import PropertyReviewsView, ReviewCreateView

urlpatterns = [
    path("property/<int:property_pk>/", PropertyReviewsView.as_view(), name="property-reviews"),
    path("", ReviewCreateView.as_view(), name="review-create"),
]
