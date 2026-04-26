from django.urls import path

from .views import (
    DriverListView,
    MyTaxiBookingsView,
    TaxiBookingCreateView,
    TransportPartnerListView,
    TransportRouteListView,
)


urlpatterns = [
    path("bookings/", TaxiBookingCreateView.as_view(), name="taxi-booking-create"),
    path("bookings/my/", MyTaxiBookingsView.as_view(), name="taxi-booking-my"),
    path("drivers/", DriverListView.as_view(), name="driver-list"),
    path("routes/", TransportRouteListView.as_view(), name="transport-route-list"),
    path("partners/", TransportPartnerListView.as_view(), name="transport-partner-list"),
]
