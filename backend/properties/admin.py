from django.contrib import admin
from django.utils.html import format_html

from .models import Property, PropertyImage
from .destination_mapping import infer_destination_for_property


class PropertyImageInline(admin.TabularInline):
    model = PropertyImage
    extra = 0
    fields = ("thumbnail", "image", "order")
    readonly_fields = ("thumbnail",)

    @admin.display(description="Preview")
    def thumbnail(self, obj):
        if getattr(obj, "image", None) and obj.image.name:
            return format_html(
                '<img src="{}" height="44" width="44" style="object-fit:cover;border-radius:4px" alt="" />',
                obj.image.url,
            )
        return "—"


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = (
        "title_sw",
        "host",
        "destination",
        "listing_type",
        "catalog_slug",
        "location",
        "price_per_night",
        "approval_status",
        "is_active",
        "created_at",
    )
    list_filter = ("approval_status", "listing_type", "destination", "is_active", "created_at")
    search_fields = ("title_sw", "location", "description_sw", "host__username", "host__email")
    autocomplete_fields = ("host", "destination")
    inlines = [PropertyImageInline]
    actions = [
        "deactivate_listings",
        "activate_listings",
        "approve_listings",
        "reject_listings",
        "auto_map_destinations",
    ]
    date_hierarchy = "created_at"
    readonly_fields = ("created_at", "updated_at")

    @admin.action(description="Deactivate selected listings")
    def deactivate_listings(self, request, queryset):
        queryset.update(is_active=False)

    @admin.action(description="Activate selected listings")
    def activate_listings(self, request, queryset):
        queryset.update(is_active=True)

    @admin.action(description="Approve selected listings")
    def approve_listings(self, request, queryset):
        queryset.update(approval_status=Property.ApprovalStatus.APPROVED)

    @admin.action(description="Reject selected listings")
    def reject_listings(self, request, queryset):
        queryset.update(approval_status=Property.ApprovalStatus.REJECTED)

    @admin.action(description="Auto-map destination for selected listings")
    def auto_map_destinations(self, request, queryset):
        destinations = None
        updated = 0
        for prop in queryset:
            if prop.destination_id:
                continue
            if destinations is None:
                # lazy cache once
                from destinations.models import Destination
                destinations = list(Destination.objects.filter(is_active=True))
            match = infer_destination_for_property(prop, destinations=destinations)
            if not match:
                continue
            prop.destination = match
            # keep hierarchy coherent for filtering/search
            prop.country = match.country
            prop.region = match.region
            prop.town = match.destination_name
            prop.save(update_fields=["destination", "country", "region", "town", "updated_at"])
            updated += 1
        self.message_user(request, f"Auto-mapped destination for {updated} listing(s).")

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("host", "destination")


@admin.register(PropertyImage)
class PropertyImageAdmin(admin.ModelAdmin):
    list_display = ("id", "property", "order", "thumbnail")
    list_filter = ("property",)
    search_fields = ("property__title_sw",)
    autocomplete_fields = ("property",)
    readonly_fields = ("thumbnail",)

    @admin.display(description="Preview")
    def thumbnail(self, obj):
        if obj.image.name:
            return format_html(
                '<img src="{}" height="48" width="48" style="object-fit:cover;border-radius:4px" alt="" />',
                obj.image.url,
            )
        return "—"

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("property")
