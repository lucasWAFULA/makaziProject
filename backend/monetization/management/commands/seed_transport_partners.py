"""
Seed all transport partners for the MakaziPlus referral ecosystem.
Safe to run multiple times (idempotent via update_or_create).
"""
from django.core.management.base import BaseCommand
from monetization.models import TransportPartner


PARTNERS = [
    # ── Ride Hailing ──────────────────────────────────────────────────────────
    {
        "name": "Uber",
        "slug": "uber",
        "partner_type": "ride_hail",
        "countries": ["KE", "TZ", "UG", "ZA", "NG", "GH"],
        "icon": "🚕",
        "color": "#000000",
        "logo_url": "",
        "tagline": "Reliable rides across East Africa",
        "referral_url": "https://m.uber.com/ul/",
        "deep_link_template": (
            "https://m.uber.com/ul/?action=setPickup"
            "&pickup[formatted_address]=Current+Location"
            "&dropoff[latitude]={lat}&dropoff[longitude]={lng}"
            "&dropoff[nickname]={name}&dropoff[formatted_address]={address}"
        ),
        "order": 1,
    },
    {
        "name": "Bolt",
        "slug": "bolt",
        "partner_type": "ride_hail",
        "countries": [],  # global / all countries
        "icon": "⚡",
        "color": "#34d186",
        "logo_url": "",
        "tagline": "Affordable rides, every day",
        "referral_url": "https://bolt.eu/",
        "deep_link_template": "",
        "order": 2,
    },
    {
        "name": "Little Cab",
        "slug": "little-cab",
        "partner_type": "ride_hail",
        "countries": ["KE"],
        "icon": "🚖",
        "color": "#f97316",
        "logo_url": "",
        "tagline": "Kenya's homegrown ride app",
        "referral_url": "https://little.africa/",
        "deep_link_template": "",
        "order": 3,
    },
    {
        "name": "SafeBoda",
        "slug": "safeboda",
        "partner_type": "ride_hail",
        "countries": ["UG", "KE"],
        "icon": "🛵",
        "color": "#e53e3e",
        "logo_url": "",
        "tagline": "Safe, fast boda rides",
        "referral_url": "https://safeboda.com/",
        "deep_link_template": "",
        "order": 4,
    },
    {
        "name": "Faras",
        "slug": "faras",
        "partner_type": "ride_hail",
        "countries": ["TZ"],
        "icon": "🚗",
        "color": "#1e40af",
        "logo_url": "",
        "tagline": "Tanzania's top ride app",
        "referral_url": "https://faras.co.tz/",
        "deep_link_template": "",
        "order": 5,
    },
    # ── Airport Transfers ─────────────────────────────────────────────────────
    {
        "name": "Airport Pickup (WhatsApp)",
        "slug": "airport-whatsapp",
        "partner_type": "airport",
        "countries": [],  # all countries
        "icon": "✈️",
        "color": "#0F5F5F",
        "logo_url": "",
        "tagline": "Pre-book your airport transfer via WhatsApp",
        "referral_url": (
            "https://wa.me/254725301031?text=Hello+MakaziPlus%2C+I+need+an+airport+transfer+to+{address}"
        ),
        "deep_link_template": (
            "https://wa.me/254725301031?text=Hello+MakaziPlus%2C+I+need+an+airport+pickup+to+"
            "{name}+({address}).+Please+send+me+transfer+options."
        ),
        "order": 6,
    },
    # ── Local Transport ───────────────────────────────────────────────────────
    {
        "name": "Coastal Tuk Tuk",
        "slug": "coastal-tuktuk",
        "partner_type": "local",
        "countries": ["KE", "TZ"],
        "icon": "🛺",
        "color": "#7c3aed",
        "logo_url": "",
        "tagline": "Fun coastal tuk tuk rides",
        "referral_url": (
            "https://wa.me/254725301031?text=Hello%2C+I+need+a+tuk+tuk+at+{address}"
        ),
        "deep_link_template": (
            "https://wa.me/254725301031?text=Hello%2C+I+need+a+tuk+tuk+at+{name}+({address})"
        ),
        "order": 7,
    },
]


class Command(BaseCommand):
    help = "Seed transport partners for the MakaziPlus referral ecosystem"

    def handle(self, *args, **options):
        created_count = 0
        updated_count = 0

        for data in PARTNERS:
            obj, created = TransportPartner.objects.update_or_create(
                slug=data["slug"],
                defaults={k: v for k, v in data.items() if k != "slug"},
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f"  [CREATED] {obj}"))
            else:
                updated_count += 1
                self.stdout.write(f"  [OK] {obj}")

        self.stdout.write(
            self.style.SUCCESS(
                f"\nDone: {created_count} created, {updated_count} updated "
                f"({len(PARTNERS)} total partners)"
            )
        )
