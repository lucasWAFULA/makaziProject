from django.urls import path
from .views import (
    AvailabilityBulkView,
    AvailabilityListView,
    BookingCreateView,
    HostDashboardStatsView,
    MyBookingsView,
)

urlpatterns = [
    path("my/", MyBookingsView.as_view(), name="my-bookings"),
    path("host-stats/", HostDashboardStatsView.as_view(), name="host-dashboard-stats"),
    path("", BookingCreateView.as_view(), name="booking-create"),
    path("availability/<int:property_pk>/", AvailabilityListView.as_view(), name="availability-list"),
    path("availability/<int:property_pk>/bulk/", AvailabilityBulkView.as_view(), name="availability-bulk"),
]
