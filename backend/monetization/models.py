"""
Monetization models for MakaziPlus.

Covers:
  - TransportPartner  : ride-hail / airport / local transport referral partners
  - ReferralClick     : lightweight click tracking for affiliate revenue attribution
  - FeaturedListing   : paid property boost campaigns
  - AdPlacement       : banner / sponsored content slots
"""
from django.conf import settings
from django.db import models
from django.utils import timezone


class TransportPartner(models.Model):
    """
    A transport provider that MakaziPlus earns referral revenue from.
    e.g. Uber, Bolt, Little Cab, SafeBoda, Faras
    """
    class Type(models.TextChoices):
        RIDE_HAIL = "ride_hail", "Ride Hailing"
        AIRPORT = "airport", "Airport Transfer"
        LOCAL = "local", "Local Transport"
        SHUTTLE = "shuttle", "Shared Shuttle"
        LUXURY = "luxury", "Luxury Chauffeur"

    name = models.CharField(max_length=80)
    slug = models.SlugField(unique=True)
    partner_type = models.CharField(max_length=20, choices=Type.choices, default=Type.RIDE_HAIL)
    # Countries this partner operates in (ISO-2 codes, e.g. ["KE","TZ"])
    countries = models.JSONField(default=list, help_text="ISO-2 country codes where this partner operates")
    icon = models.CharField(max_length=10, default="🚕", help_text="Emoji icon for the partner")
    logo_url = models.URLField(blank=True, default="")
    color = models.CharField(max_length=20, default="#1f2933", help_text="Brand hex color for UI")
    # Base referral / deep link URL
    referral_url = models.URLField(help_text="Base URL or affiliate link for this partner")
    # Template for deep links with property context, supports {lat} {lng} {name} {address}
    deep_link_template = models.TextField(
        blank=True,
        default="",
        help_text=(
            "Deep link URL template. Use {lat}, {lng}, {name}, {address} placeholders. "
            "Leave blank to use referral_url as-is."
        ),
    )
    tagline = models.CharField(max_length=120, blank=True, default="")
    is_active = models.BooleanField(default=True)
    order = models.PositiveSmallIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order", "name"]

    def __str__(self):
        return f"{self.icon} {self.name} ({self.get_partner_type_display()})"

    def build_deep_link(self, lat=None, lng=None, name="", address="") -> str:
        """Return a deep link URL pre-filled with property context."""
        template = self.deep_link_template.strip()
        if not template:
            return self.referral_url
        return (
            template
            .replace("{lat}", str(lat or ""))
            .replace("{lng}", str(lng or ""))
            .replace("{name}", name or "")
            .replace("{address}", address or "")
        )


class ReferralClick(models.Model):
    """
    Tracks a click on a transport partner referral link.
    Used for revenue attribution and partner reporting.
    """
    partner = models.ForeignKey(
        TransportPartner, on_delete=models.CASCADE, related_name="clicks"
    )
    property_id = models.PositiveIntegerField(null=True, blank=True)
    property_location = models.CharField(max_length=200, blank=True, default="")
    country = models.CharField(max_length=10, blank=True, default="")
    session_key = models.CharField(max_length=64, blank=True, default="")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="referral_clicks",
    )
    user_agent = models.TextField(blank=True, default="")
    clicked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-clicked_at"]

    def __str__(self):
        return f"Click → {self.partner.name} (property {self.property_id}) @ {self.clicked_at:%Y-%m-%d}"


class FeaturedListing(models.Model):
    """
    Paid listing promotion. Active campaigns push the property to the top of
    search results and apply a "Featured" badge.
    """
    class Tier(models.TextChoices):
        BASIC = "basic", "Basic (KES 1,000/mo)"
        PREMIUM = "premium", "Premium (KES 5,000/mo)"
        SPOTLIGHT = "spotlight", "Spotlight (KES 15,000/mo)"

    listing = models.ForeignKey(
        "properties.Property",
        on_delete=models.CASCADE,
        related_name="featured_campaigns",
    )
    tier = models.CharField(max_length=20, choices=Tier.choices, default=Tier.BASIC)
    starts_at = models.DateTimeField()
    ends_at = models.DateTimeField()
    price_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    currency = models.CharField(max_length=5, default="KES")
    notes = models.TextField(blank=True, default="")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-starts_at"]

    def __str__(self):
        return f"{self.listing} [{self.tier}] {self.starts_at:%Y-%m-%d} → {self.ends_at:%Y-%m-%d}"

    def is_live_now(self) -> bool:
        now = timezone.now()
        return self.is_active and self.starts_at <= now <= self.ends_at


class AdPlacement(models.Model):
    """
    Sponsored banner / content placement on the site.
    """
    class Slot(models.TextChoices):
        HOME_BANNER = "home_banner", "Home Page Banner"
        SEARCH_SIDEBAR = "search_sidebar", "Search Sidebar"
        DETAIL_PAGE = "detail_page", "Property Detail Page"
        PACKAGES_TOP = "packages_top", "Packages Page Top"

    slot = models.CharField(max_length=30, choices=Slot.choices)
    title = models.CharField(max_length=160)
    subtitle = models.CharField(max_length=200, blank=True, default="")
    cta_label = models.CharField(max_length=60, default="Learn more")
    cta_url = models.URLField()
    image_url = models.URLField(blank=True, default="")
    background_color = models.CharField(max_length=20, blank=True, default="")
    starts_at = models.DateTimeField()
    ends_at = models.DateTimeField()
    price_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    currency = models.CharField(max_length=5, default="KES")
    is_active = models.BooleanField(default=True)
    impressions = models.PositiveIntegerField(default=0)
    clicks = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-starts_at"]

    def __str__(self):
        return f"[{self.get_slot_display()}] {self.title}"

    @property
    def is_live(self) -> bool:
        now = timezone.now()
        return self.is_active and self.starts_at <= now <= self.ends_at
