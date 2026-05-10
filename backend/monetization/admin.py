from django.contrib import admin
from django.utils.html import format_html
from django.utils import timezone

from .models import TransportPartner, ReferralClick, FeaturedListing, AdPlacement


@admin.register(TransportPartner)
class TransportPartnerAdmin(admin.ModelAdmin):
    list_display = ("icon", "name", "partner_type", "countries_display", "is_active", "order", "click_count")
    list_editable = ("is_active", "order")
    list_filter = ("partner_type", "is_active")
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}

    @admin.display(description="Countries")
    def countries_display(self, obj):
        return ", ".join(obj.countries or []) or "All"

    @admin.display(description="Clicks")
    def click_count(self, obj):
        return obj.clicks.count()


@admin.register(ReferralClick)
class ReferralClickAdmin(admin.ModelAdmin):
    list_display = ("partner", "property_id", "property_location", "country", "clicked_at")
    list_filter = ("partner", "country", "clicked_at")
    search_fields = ("property_location", "country", "session_key")
    readonly_fields = ("clicked_at",)
    date_hierarchy = "clicked_at"

    def has_add_permission(self, request):
        return False


@admin.register(FeaturedListing)
class FeaturedListingAdmin(admin.ModelAdmin):
    list_display = ("property", "tier", "status_badge", "starts_at", "ends_at", "price_paid", "currency")
    list_filter = ("tier", "is_active")
    search_fields = ("property__title_sw", "property__location")
    readonly_fields = ("created_at",)
    date_hierarchy = "starts_at"

    @admin.display(description="Status")
    def status_badge(self, obj):
        if obj.is_live:
            return format_html(
                '<span style="background:#059669;color:#fff;padding:2px 10px;border-radius:999px;font-size:11px;">LIVE</span>'
            )
        now = timezone.now()
        if obj.ends_at < now:
            return format_html(
                '<span style="background:#6B7280;color:#fff;padding:2px 10px;border-radius:999px;font-size:11px;">EXPIRED</span>'
            )
        return format_html(
            '<span style="background:#D97706;color:#fff;padding:2px 10px;border-radius:999px;font-size:11px;">SCHEDULED</span>'
        )


@admin.register(AdPlacement)
class AdPlacementAdmin(admin.ModelAdmin):
    list_display = ("title", "slot", "status_badge", "starts_at", "ends_at", "impressions", "clicks", "ctr")
    list_filter = ("slot", "is_active")
    search_fields = ("title",)
    readonly_fields = ("impressions", "clicks", "created_at")
    date_hierarchy = "starts_at"

    @admin.display(description="Status")
    def status_badge(self, obj):
        if obj.is_live:
            return format_html(
                '<span style="background:#059669;color:#fff;padding:2px 10px;border-radius:999px;font-size:11px;">LIVE</span>'
            )
        return format_html(
            '<span style="background:#6B7280;color:#fff;padding:2px 10px;border-radius:999px;font-size:11px;">INACTIVE</span>'
        )

    @admin.display(description="CTR")
    def ctr(self, obj):
        if obj.impressions:
            return f"{obj.clicks / obj.impressions * 100:.1f}%"
        return "—"
