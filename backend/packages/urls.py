from django.urls import path

from .views import TravelPackageListView


urlpatterns = [
    path("", TravelPackageListView.as_view(), name="travel-package-list"),
]
