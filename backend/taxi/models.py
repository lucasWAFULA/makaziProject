from django.conf import settings
from django.db import models


class DriverProfile(models.Model):
    class VehicleType(models.TextChoices):
        SEDAN = "sedan", "Sedan"
        SUV = "suv", "SUV"
        VAN = "van", "Van"
        BUS = "bus", "Bus"

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="driver_profile")
    vehicle_type = models.CharField(max_length=20, choices=VehicleType.choices, default=VehicleType.SEDAN)
    plate_number = models.CharField(max_length=20)
    is_verified = models.BooleanField(default=False)
    is_available = models.BooleanField(default=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)

    def __str__(self):
        return f"{self.user.username} ({self.vehicle_type})"


class TaxiBooking(models.Model):
    class Status(models.TextChoices):
        NEW = "new", "New"
        CONTACTED = "contacted", "Contacted"
        CONFIRMED = "confirmed", "Confirmed"
        CANCELLED = "cancelled", "Cancelled"
        ASSIGNED = "assigned", "Assigned"
        ON_TRIP = "on_trip", "On trip"
        COMPLETED = "completed", "Completed"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="taxi_bookings",
    )
    pickup = models.CharField(max_length=255)
    destination = models.CharField(max_length=255)
    travel_date = models.DateField()
    pickup_time = models.TimeField()
    passengers = models.PositiveSmallIntegerField(default=1)
    phone_number = models.CharField(max_length=30)
    notes = models.TextField(blank=True)
    vehicle_type = models.CharField(max_length=20, blank=True, default="")
    return_trip = models.BooleanField(default=False)
    estimated_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    driver = models.ForeignKey(DriverProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name="trips")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NEW)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"TaxiBooking {self.pk}: {self.pickup} -> {self.destination}"


class TransportRoute(models.Model):
    class RouteCategory(models.TextChoices):
        AIRPORT_TRANSFER = "Airport Transfer", "Airport Transfer"
        RAIL_TRANSFER = "Rail Transfer", "Rail Transfer"
        FERRY_GUIDE = "Ferry Guide", "Ferry Guide"
        FERRY_TRANSFER = "Ferry Transfer", "Ferry Transfer"
        FERRY_ROUTE = "Ferry Route", "Ferry Route"
        BEACH_TRANSFER = "Beach Transfer", "Beach Transfer"
        NORTH_COAST_TRANSFER = "North Coast Transfer", "North Coast Transfer"
        ISLAND_TRANSFER = "Island Transfer", "Island Transfer"
        CITY_TRANSFER = "City Transfer", "City Transfer"
        ISLAND_DAY_TRIP = "Island Day Trip", "Island Day Trip"
        COASTAL_TRANSFER = "Coastal Transfer", "Coastal Transfer"
        SOUTHERN_COAST_TRANSFER = "Southern Coast Transfer", "Southern Coast Transfer"

    class TransportType(models.TextChoices):
        TAXI = "Taxi", "Taxi"
        TAXI_FERRY = "Taxi/Ferry Transfer", "Taxi/Ferry Transfer"
        TAXI_MATATU = "Taxi/Matatu", "Taxi/Matatu"
        TAXI_BOAT = "Taxi + Boat", "Taxi + Boat"
        TAXI_RESORT = "Taxi/Resort Transfer", "Taxi/Resort Transfer"
        PRIVATE_TRANSFER = "Taxi/Private Transfer", "Taxi/Private Transfer"
        PRIVATE = "Private Transfer", "Private Transfer"
        TAXI_SHUTTLE = "Taxi/Shuttle", "Taxi/Shuttle"
        TAXI_WALK = "Taxi/Walk", "Taxi/Walk"
        FERRY = "Ferry", "Ferry"
        BUS_PRIVATE = "Bus/Private Transfer", "Bus/Private Transfer"
        BOAT = "Boat Transfer", "Boat Transfer"
        FLIGHT_BUS_BOAT = "Flight/Bus + Boat", "Flight/Bus + Boat"

    country = models.CharField(max_length=100)
    route_category = models.CharField(max_length=100, choices=RouteCategory.choices)
    origin = models.CharField(max_length=150)
    destination = models.CharField(max_length=150)
    transport_type = models.CharField(max_length=100, choices=TransportType.choices)
    estimated_time = models.CharField(max_length=100, blank=True)
    price_min = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    price_max = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    currency = models.CharField(max_length=20, default="KES")
    notes = models.TextField(blank=True)
    is_featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["country", "route_category", "origin"]
        indexes = [
            models.Index(fields=["country", "is_active"], name="taxi_tr_country_idx"),
            models.Index(fields=["origin", "destination"], name="taxi_tr_origin_idx"),
            models.Index(fields=["is_featured", "is_active"], name="taxi_tr_feature_idx"),
        ]

    def __str__(self):
        return f"{self.origin} → {self.destination} ({self.transport_type})"


class TransportPartner(models.Model):
    class ServiceType(models.TextChoices):
        RIDE_APP = "ride_app", "Ride App"
        AIRPORT_TRANSFER = "airport_transfer", "Airport Transfer"
        PRIVATE_TRANSFER = "private_transfer", "Private Transfer"
        LOCAL_TAXI = "local_taxi", "Local Taxi"
        TOUR_TRANSFER = "tour_transfer", "Tour Transfer"

    name = models.CharField(max_length=100)
    region = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100, blank=True)
    service_type = models.CharField(max_length=50, choices=ServiceType.choices)
    logo_url = models.URLField(blank=True)
    booking_url = models.URLField(blank=True)
    whatsapp_number = models.CharField(max_length=30, blank=True)
    description = models.CharField(max_length=255, blank=True)
    is_external = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    active = models.BooleanField(default=True)
    priority = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["priority", "name"]
        indexes = [
            models.Index(fields=["active", "is_featured"], name="taxi_tp_active_idx"),
            models.Index(fields=["region", "city"], name="taxi_tp_region_idx"),
            models.Index(fields=["service_type", "active"], name="taxi_tp_service_idx"),
        ]

    def __str__(self):
        location = self.city or self.region or "Regional"
        return f"{self.name} - {location}"
