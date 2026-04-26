from django.contrib import admin
from django.utils import timezone

from .models import Availability, Booking


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "property",
        "check_in",
        "check_out",
        "total_price",
        "booking_reference",
        "status",
        "payment_reference",
        "created_at",
    )
    list_filter = ("status", "check_in", "created_at")
    search_fields = (
        "user__email",
        "user__username",
        "property__title_sw",
        "booking_reference",
        "payment_reference",
    )
    autocomplete_fields = ("user", "property")
    date_hierarchy = "check_in"
    readonly_fields = ("created_at", "cancelled_at")
    actions = ["mark_cancelled", "mark_confirmed"]
    fieldsets = (
        (None, {"fields": ("user", "property", "check_in", "check_out", "total_price", "booking_reference", "status")}),
        ("Payment / cancellation", {"fields": ("payment_reference", "cancelled_at", "cancellation_reason")}),
        ("Meta", {"fields": ("created_at",)}),
    )

    @admin.action(description="Cancel selected bookings")
    def mark_cancelled(self, request, queryset):
        queryset.update(status=Booking.Status.CANCELLED, cancelled_at=timezone.now())

    @admin.action(description="Mark selected as confirmed")
    def mark_confirmed(self, request, queryset):
        queryset.update(status=Booking.Status.CONFIRMED)

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("user", "property")


@admin.register(Availability)
class AvailabilityAdmin(admin.ModelAdmin):
    list_display = ("property", "date", "is_available")
    list_filter = ("is_available", "date")
    search_fields = ("property__title_sw",)
    autocomplete_fields = ("property",)
    date_hierarchy = "date"

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("property")
