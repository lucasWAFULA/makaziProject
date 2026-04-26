from django.db import models
from django.conf import settings
from destinations.models import Destination

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

    host = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="properties")
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
    listing_type = models.CharField(max_length=20, choices=ListingType.choices, default=ListingType.HOUSE)
    catalog_slug = models.CharField(max_length=50, blank=True, default="", db_index=True)
    price_per_night = models.DecimalField(max_digits=12, decimal_places=2)
    rules_sw = models.TextField(blank=True)
    amenities = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=True)
    approval_status = models.CharField(max_length=30, choices=ApprovalStatus.choices, default=ApprovalStatus.DRAFT)
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
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to=property_image_upload_to)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]
