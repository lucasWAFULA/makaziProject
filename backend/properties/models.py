from django.db import models
from django.conf import settings
from django.utils.text import slugify
from destinations.models import Destination


class PropertyCategory(models.Model):
    """Top-level accommodation category (Apartment, Villa, Hotel, etc.)"""

    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    icon = models.CharField(max_length=100, blank=True, help_text="Emoji or icon class")
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0, db_index=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Property Category"
        verbose_name_plural = "Property Categories"
        ordering = ["order", "name"]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class PropertyType(models.Model):
    """Property sub-type within a category (e.g. '2 Bedroom Apartment' under 'Apartment')"""

    category = models.ForeignKey(
        PropertyCategory, on_delete=models.CASCADE, related_name="types"
    )
    name = models.CharField(max_length=100)
    slug = models.SlugField()
    order = models.PositiveIntegerField(default=0, db_index=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Property Type"
        verbose_name_plural = "Property Types"
        unique_together = [["category", "slug"]]
        ordering = ["order", "name"]

    def __str__(self):
        return f"{self.category.name} — {self.name}"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class PropertyFeature(models.Model):
    """Filterable feature/amenity tag for a property"""

    class FeatureGroup(models.TextChoices):
        LOCATION = "location", "Location"
        PROPERTY = "property", "Property"
        EXPERIENCE = "experience", "Experience"
        SERVICE = "service", "Service"

    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    feature_group = models.CharField(
        max_length=20, choices=FeatureGroup.choices, db_index=True
    )
    icon = models.CharField(max_length=100, blank=True, help_text="Emoji or icon class")
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["feature_group", "order", "name"]

    def __str__(self):
        return f"{self.get_feature_group_display()} / {self.name}"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Property(models.Model):

    class ListingType(models.TextChoices):
        HOUSE = "house", "House"
        APARTMENT = "apartment", "Apartment"
        BNB = "bnb", "BnB"
        HOTEL = "hotel", "Hotel"
        VILLA = "villa", "Villa"

    class ApprovalStatus(models.TextChoices):
        DRAFT = "draft", "Draft"
        PENDING = "pending_approval", "Pending Approval"
        APPROVED = "approved", "Approved"
        LIVE = "live", "Live"
        PAUSED = "paused", "Paused"
        REJECTED = "rejected", "Rejected"
        SUSPENDED = "suspended", "Suspended"
        EXPIRED = "expired", "Expired"

    class VerificationTier(models.TextChoices):
        UNVERIFIED = "unverified", "Unverified"
        REMOTE_VERIFIED = "remote_verified", "Remote Verified"
        PREMIUM_VERIFIED = "premium_verified", "Premium Verified"

    class PriceTier(models.TextChoices):
        BUDGET = "budget", "Budget"
        STANDARD = "standard", "Standard"
        PREMIUM = "premium", "Premium"
        LUXURY = "luxury", "Luxury"
        ULTRA_LUXURY = "ultra_luxury", "Ultra Luxury"

    class StayStyle(models.TextChoices):
        SOLO = "solo", "Solo Stay"
        COUPLE = "couple", "Couple Stay"
        FAMILY = "family", "Family Stay"
        GROUP = "group", "Group Stay"
        CORPORATE = "corporate", "Corporate Stay"
        BACKPACKER = "backpacker", "Backpacker Stay"

    # ── Normalized taxonomy ─────────────────────────────────────────────────
    category = models.ForeignKey(
        PropertyCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="properties",
    )
    property_type = models.ForeignKey(
        PropertyType,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="properties",
    )
    features = models.ManyToManyField(
        PropertyFeature,
        blank=True,
        related_name="properties",
    )

    # ── Configuration fields ────────────────────────────────────────────────
    bedrooms = models.PositiveSmallIntegerField(null=True, blank=True)
    beds = models.PositiveSmallIntegerField(null=True, blank=True)
    bathrooms = models.PositiveSmallIntegerField(null=True, blank=True)
    max_guests = models.PositiveSmallIntegerField(null=True, blank=True)
    floor_count = models.PositiveSmallIntegerField(null=True, blank=True)
    room_size_sqm = models.DecimalField(
        max_digits=8, decimal_places=2, null=True, blank=True
    )

    # ── Classification ──────────────────────────────────────────────────────
    price_tier = models.CharField(
        max_length=20,
        choices=PriceTier.choices,
        blank=True,
        default="",
        db_index=True,
    )
    stay_style = models.CharField(
        max_length=20,
        choices=StayStyle.choices,
        blank=True,
        default="",
        db_index=True,
    )

    # ── Core / Legacy fields ────────────────────────────────────────────────
    host = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="properties"
    )
    title_sw = models.CharField(max_length=255)
    description_sw = models.TextField(blank=True)
    location = models.CharField(max_length=255)
    destination = models.ForeignKey(
        Destination,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="properties",
    )
    country = models.CharField(max_length=80, blank=True, default="")
    region = models.CharField(max_length=80, blank=True, default="")
    town = models.CharField(max_length=80, blank=True, default="")
    listing_type = models.CharField(
        max_length=20,
        choices=ListingType.choices,
        default=ListingType.HOUSE,
        help_text="[DEPRECATED] Use category + property_type instead.",
    )
    catalog_slug = models.CharField(max_length=50, blank=True, default="", db_index=True)
    price_per_night = models.DecimalField(max_digits=12, decimal_places=2)
    rules_sw = models.TextField(blank=True)
    amenities = models.JSONField(default=list, blank=True)

    # ── Location detail ─────────────────────────────────────────────────────
    latitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )
    longitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )
    landmark = models.CharField(max_length=255, blank=True, default="")
    contact_name = models.CharField(max_length=120, blank=True, default="")
    contact_phone = models.CharField(max_length=30, blank=True, default="")
    ownership_details = models.TextField(blank=True, default="")
    walkthrough_video_url = models.URLField(blank=True, default="")

    # ── Verification ────────────────────────────────────────────────────────
    verification_tier = models.CharField(
        max_length=30,
        choices=VerificationTier.choices,
        default=VerificationTier.UNVERIFIED,
        db_index=True,
    )
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="verified_properties",
    )
    verified_at = models.DateTimeField(null=True, blank=True)
    verification_notes = models.TextField(blank=True, default="")

    # ── Approval workflow ───────────────────────────────────────────────────
    is_active = models.BooleanField(default=True)
    approval_status = models.CharField(
        max_length=30,
        choices=ApprovalStatus.choices,
        default=ApprovalStatus.DRAFT,
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_properties",
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Properties"
        ordering = ["-created_at"]

    def __str__(self):
        return self.title_sw


def property_image_upload_to(instance, filename):
    return f"properties/{instance.property_id}/{filename}"


class PropertyImage(models.Model):
    property = models.ForeignKey(
        Property, on_delete=models.CASCADE, related_name="images"
    )
    image = models.ImageField(upload_to=property_image_upload_to)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]


def property_video_upload_to(instance, filename):
    return f"properties/{instance.property_id}/videos/{filename}"


class PropertyVideo(models.Model):
    """Short video clip or walkthrough uploaded by the host/agent."""
    property = models.ForeignKey(
        Property, on_delete=models.CASCADE, related_name="videos"
    )
    video = models.FileField(
        upload_to=property_video_upload_to,
        blank=True,
        default="",
        help_text="Upload MP4/MOV (max 100 MB). Or use the external_url field for YouTube/Drive links.",
    )
    external_url = models.URLField(
        blank=True,
        default="",
        help_text="YouTube, Google Drive or other shareable video link.",
    )
    title = models.CharField(max_length=200, blank=True, default="")
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return self.title or f"Video #{self.pk} for property {self.property_id}"

