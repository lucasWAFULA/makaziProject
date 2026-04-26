from django.contrib import admin

from .models import TaxiBooking, DriverProfile, TransportPartner, TransportRoute


@admin.register(TaxiBooking)
class TaxiBookingAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "pickup",
        "destination",
        "travel_date",
        "pickup_time",
        "passengers",
        "phone_number",
        "status",
        "created_at",
    )
    list_filter = ("status", "travel_date", "created_at")
    search_fields = ("pickup", "destination", "phone_number", "user__username", "user__email")


@admin.register(DriverProfile)
class DriverProfileAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "vehicle_type", "plate_number", "is_verified", "is_available", "rating")
    list_filter = ("vehicle_type", "is_verified", "is_available")
    search_fields = ("user__username", "user__email", "plate_number")


@admin.register(TransportRoute)
class TransportRouteAdmin(admin.ModelAdmin):
    list_display = (
        "origin",
        "destination",
        "country",
        "route_category",
        "transport_type",
        "estimated_time",
        "price_min",
        "price_max",
        "currency",
        "is_featured",
        "is_active",
    )
    list_filter = ("country", "route_category", "transport_type", "is_featured", "is_active")
    search_fields = ("origin", "destination", "notes")
    list_editable = ("is_featured", "is_active")
    fieldsets = (
        (
            "Route Information",
            {"fields": ("country", "route_category", "origin", "destination", "transport_type")},
        ),
        ("Timing & Pricing", {"fields": ("estimated_time", "price_min", "price_max", "currency")}),
        ("Details", {"fields": ("notes", "is_featured", "is_active")}),
    )
    readonly_fields = ("created_at", "updated_at")


@admin.register(TransportPartner)
class TransportPartnerAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "city",
        "region",
        "service_type",
        "is_featured",
        "active",
        "priority",
    )
    list_filter = ("service_type", "region", "city", "is_featured", "active")
    search_fields = ("name", "region", "city", "description", "whatsapp_number")
    list_editable = ("is_featured", "active", "priority")
    fieldsets = (
        ("Partner", {"fields": ("name", "service_type", "description", "logo_url")}),
        ("Coverage", {"fields": ("region", "city")}),
        ("Booking", {"fields": ("booking_url", "whatsapp_number", "is_external")}),
        ("Display", {"fields": ("is_featured", "active", "priority")}),
    )
    readonly_fields = ("created_at", "updated_at")
