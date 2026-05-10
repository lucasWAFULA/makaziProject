from django.contrib import admin
from django.utils import timezone
from django.utils.html import format_html

from .models import Property, PropertyImage, PropertyCategory, PropertyType, PropertyFeature
from .destination_mapping import infer_destination_for_property


# ── PropertyFeature ────────────────────────────────────────────────────────────

@admin.register(PropertyFeature)
class PropertyFeatureAdmin(admin.ModelAdmin):
    list_display = ("name", "feature_group", "icon", "order", "is_active")
    list_filter = ("feature_group", "is_active")
    search_fields = ("name", "slug")
    list_editable = ("order", "is_active")
    prepopulated_fields = {"slug": ("name",)}
    ordering = ("feature_group", "order", "name")


# ── PropertyType (inline inside Category) ─────────────────────────────────────

class PropertyTypeInline(admin.TabularInline):
    model = PropertyType
    extra = 0
    fields = ("name", "slug", "order", "is_active")
    prepopulated_fields = {"slug": ("name",)}
    ordering = ("order", "name")


# ── PropertyCategory ──────────────────────────────────────────────────────────

@admin.register(PropertyCategory)
class PropertyCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "icon", "order", "type_count", "is_active")
    list_filter = ("is_active",)
    search_fields = ("name", "slug")
    list_editable = ("order", "is_active")
    prepopulated_fields = {"slug": ("name",)}
    inlines = [PropertyTypeInline]

    @admin.display(description="Types")
    def type_count(self, obj):
        return obj.types.count()


# ── PropertyType (standalone) ─────────────────────────────────────────────────

@admin.register(PropertyType)
class PropertyTypeAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "slug", "order", "is_active")
    list_filter = ("category", "is_active")
    search_fields = ("name", "slug", "category__name")
    list_editable = ("order", "is_active")
    prepopulated_fields = {"slug": ("name",)}
    autocomplete_fields = ("category",)


# ── PropertyImage inline ──────────────────────────────────────────────────────

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


# ── Property ──────────────────────────────────────────────────────────────────

@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = (
        "title_sw",
        "host",
        "category",
        "property_type",
        "destination",
        "price_per_night",
        "price_tier",
        "bedrooms",
        "max_guests",
        "approval_status",
        "verification_tier",
        "is_active",
        "created_at",
    )
    list_filter = (
        "approval_status",
        "verification_tier",
        "category",
        "price_tier",
        "stay_style",
        "is_active",
        "is_featured",
        "destination",
        "created_at",
    )
    search_fields = (
        "title_sw", "location", "description_sw",
        "host__username", "host__email",
        "category__name", "property_type__name",
    )
    autocomplete_fields = ("host", "destination", "category", "property_type")
    filter_horizontal = ("features",)
    inlines = [PropertyImageInline]
    actions = [
        "deactivate_listings",
        "activate_listings",
        "approve_listings",
        "reject_listings",
        "mark_unverified",
        "mark_remote_verified",
        "mark_premium_verified",
        "auto_map_destinations",
    ]
    date_hierarchy = "created_at"
    readonly_fields = ("created_at", "updated_at")

    fieldsets = (
        ("Identity", {
            "fields": ("host", "title_sw", "description_sw", "rules_sw"),
        }),
        ("Classification", {
            "fields": ("category", "property_type", "listing_type", "catalog_slug", "features"),
        }),
        ("Configuration", {
            "fields": ("bedrooms", "beds", "bathrooms", "max_guests", "floor_count", "room_size_sqm"),
        }),
        ("Pricing", {
            "fields": ("price_per_night", "price_tier"),
        }),
        ("Stay Style", {
            "fields": ("stay_style",),
        }),
        ("Location", {
            "fields": ("destination", "country", "region", "town", "location", "latitude", "longitude", "landmark"),
        }),
        ("Legacy Amenities", {
            "fields": ("amenities",),
            "classes": ("collapse",),
        }),
        ("Host Onboarding", {
            "fields": ("contact_name", "contact_phone", "ownership_details", "walkthrough_video_url"),
            "classes": ("collapse",),
        }),
        ("Status & Verification", {
            "fields": (
                "is_active", "is_featured", "approval_status", "approved_by", "approved_at", "rejection_reason",
                "verification_tier", "verified_by", "verified_at", "verification_notes",
            ),
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",),
        }),
    )

    @admin.action(description="Deactivate selected listings")
    def deactivate_listings(self, request, queryset):
        queryset.update(is_active=False)

    @admin.action(description="Activate selected listings")
    def activate_listings(self, request, queryset):
        queryset.update(is_active=True)

    @admin.action(description="Approve selected listings")
    def approve_listings(self, request, queryset):
        queryset.update(
            approval_status=Property.ApprovalStatus.APPROVED,
            approved_by=request.user,
            approved_at=timezone.now(),
            rejection_reason="",
        )

    @admin.action(description="Reject selected listings")
    def reject_listings(self, request, queryset):
        queryset.update(
            approval_status=Property.ApprovalStatus.REJECTED,
            approved_by=None,
            approved_at=None,
        )

    @admin.action(description="Mark selected as Unverified")
    def mark_unverified(self, request, queryset):
        queryset.update(
            verification_tier=Property.VerificationTier.UNVERIFIED,
            verified_by=None,
            verified_at=None,
        )

    @admin.action(description="Mark selected as Remote Verified")
    def mark_remote_verified(self, request, queryset):
        queryset.update(
            verification_tier=Property.VerificationTier.REMOTE_VERIFIED,
            verified_by=request.user,
            verified_at=timezone.now(),
        )

    @admin.action(description="Mark selected as Premium Verified")
    def mark_premium_verified(self, request, queryset):
        queryset.update(
            verification_tier=Property.VerificationTier.PREMIUM_VERIFIED,
            verified_by=request.user,
            verified_at=timezone.now(),
        )

    @admin.action(description="Auto-map destination for selected listings")
    def auto_map_destinations(self, request, queryset):
        destinations = None
        updated = 0
        for prop in queryset:
            if prop.destination_id:
                continue
            if destinations is None:
                from destinations.models import Destination
                destinations = list(Destination.objects.filter(is_active=True))
            match = infer_destination_for_property(prop, destinations=destinations)
            if not match:
                continue
            prop.destination = match
            prop.country = match.country
            prop.region = match.region
            prop.town = match.destination_name
            prop.save(update_fields=["destination", "country", "region", "town", "updated_at"])
            updated += 1
        self.message_user(request, f"Auto-mapped destination for {updated} listing(s).")

    def get_queryset(self, request):
        return (
            super().get_queryset(request)
            .select_related("host", "destination", "category", "property_type")
            .prefetch_related("features")
        )


# ── PropertyImage standalone ──────────────────────────────────────────────────

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
