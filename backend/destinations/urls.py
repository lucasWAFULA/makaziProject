from django.urls import path

from .views import DestinationListView, DestinationDetailView


urlpatterns = [
    path("", DestinationListView.as_view(), name="destination-list"),
    path("<slug:destination_slug>/", DestinationDetailView.as_view(), name="destination-detail"),
]
