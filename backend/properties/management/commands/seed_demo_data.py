"""
Management command to seed the database with demo properties and packages.

Usage:
    python manage.py seed_demo_data
    python manage.py seed_demo_data --clear    # wipe existing demo data first
    python manage.py seed_demo_data --host-email admin@example.com
"""

import decimal
from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth import get_user_model
from django.utils.text import slugify

User = get_user_model()


PROPERTIES = [
    {
        "title_sw": "Villa ya Bahari - Diani Beach",
        "description_sw": "Villa ya anasa yenye mtazamo wa bahari kamili. Inajumuisha bwawa la kuogelea, jiko kikamilifu, na ukanda wa pwani wa kibinafsi.",
        "location": "Diani Beach",
        "country": "Kenya", "region": "Kwale", "town": "Diani",
        "listing_type": "villa",
        "category_slug": "villa", "type_name": "Beach Villa",
        "price_per_night": decimal.Decimal("150000"),
        "base_currency": "UGX",
        "price_tier": "budget", "stay_style": "couple",
        "bedrooms": 3, "beds": 4, "bathrooms": 3, "max_guests": 6,
        "amenities": ["Bwawa la kuogelea", "WiFi", "Jiko", "Eneo la kuegesha gari", "AC", "View ya bahari"],
        "feature_slugs": ["private-pool", "wifi", "beachfront", "ocean-view", "parking", "kitchen", "couple-friendly"],
        "is_featured": True,
    },
    {
        "title_sw": "Apartment ya Kisasa - Nyali Mombasa",
        "description_sw": "Apartment yenye chumba 2, inafaa kwa watu wanaofanya kazi. WiFi ya kasi na ulinzi wa saa 24.",
        "location": "Nyali",
        "country": "Kenya", "region": "Mombasa", "town": "Nyali",
        "listing_type": "apartment",
        "category_slug": "apartment", "type_name": "2 Bedroom Apartment",
        "price_per_night": decimal.Decimal("85000"),
        "base_currency": "TZS",
        "price_tier": "standard", "stay_style": "corporate",
        "bedrooms": 2, "beds": 2, "bathrooms": 1, "max_guests": 4,
        "amenities": ["WiFi ya haraka", "Ulinzi 24/7", "Jiko", "Umeme wa backup", "AC"],
        "feature_slugs": ["wifi", "security", "kitchen", "backup-generator", "air-conditioning", "work-friendly"],
        "is_featured": False,
    },
    {
        "title_sw": "BnB ya Ufukweni - Watamu",
        "description_sw": "Karibu na bahari na mapango ya Watamu. Chakula cha asubuhi kimejumuishwa. Mazingira ya utulivu.",
        "location": "Watamu",
        "country": "Kenya", "region": "Kilifi", "town": "Watamu",
        "listing_type": "bnb",
        "category_slug": "bnb", "type_name": "Beachfront BnB",
        "price_per_night": decimal.Decimal("4200"),
        "base_currency": "KES",
        "price_tier": "standard", "stay_style": "couple",
        "bedrooms": 1, "beds": 1, "bathrooms": 1, "max_guests": 2,
        "amenities": ["Chakula cha asubuhi", "WiFi", "Bafu binafsi", "Bustani", "Karibu na bahari"],
        "feature_slugs": ["breakfast-included", "wifi", "beachfront", "near-beach", "couple-friendly", "family-friendly"],
        "is_featured": False,
    },
    {
        "title_sw": "Nyumba ya Familia - Malindi",
        "description_sw": "Nyumba kubwa yenye vyumba 3, inafaa kwa familia. Bustani nzuri na nafasi ya kucheza watoto.",
        "location": "Malindi",
        "country": "Kenya", "region": "Kilifi", "town": "Malindi",
        "listing_type": "house",
        "category_slug": "vacation-home", "type_name": "Family Vacation Home",
        "price_per_night": decimal.Decimal("7500"),
        "base_currency": "KES",
        "price_tier": "standard", "stay_style": "family",
        "bedrooms": 3, "beds": 4, "bathrooms": 2, "max_guests": 8,
        "amenities": ["Bustani", "Jiko kubwa", "Parking", "WiFi", "Vyumba 3"],
        "feature_slugs": ["garden-view", "kitchen", "parking", "wifi", "family-friendly"],
        "is_featured": False,
    },
    {
        "title_sw": "Studio ya Zanzibar Stone Town",
        "description_sw": "Studio nzuri katikati ya Stone Town yenye historia. Karibu na masoko, mikahawa na bandari ya feri.",
        "location": "Stone Town",
        "country": "Tanzania", "region": "Zanzibar Urban/West", "town": "Zanzibar",
        "listing_type": "apartment",
        "category_slug": "apartment", "type_name": "Studio Apartment",
        "price_per_night": decimal.Decimal("60000"),
        "base_currency": "TZS",
        "price_tier": "standard", "stay_style": "solo",
        "bedrooms": 0, "beds": 1, "bathrooms": 1, "max_guests": 2,
        "amenities": ["WiFi", "AC", "View ya mji", "Karibu na feri", "Jiko kidogo"],
        "feature_slugs": ["wifi", "air-conditioning", "city-view", "near-cbd", "self-check-in"],
        "is_featured": True,
    },
    {
        "title_sw": "Villa ya Nungwi - Kaskazini Zanzibar",
        "description_sw": "Villa ya kipekee kaskazini mwa Zanzibar. Machweo ya jua mazuri kabisa. Pool ya infinity na huduma kamili.",
        "location": "Nungwi",
        "country": "Tanzania", "region": "Zanzibar North", "town": "Nungwi",
        "listing_type": "villa",
        "category_slug": "villa", "type_name": "Private Pool Villa",
        "price_per_night": decimal.Decimal("22000"),
        "base_currency": "TZS",
        "price_tier": "luxury", "stay_style": "couple",
        "bedrooms": 4, "beds": 5, "bathrooms": 4, "max_guests": 8,
        "amenities": ["Pool ya Infinity", "Breakfast", "AC", "WiFi", "View ya bahari", "Huduma kamili"],
        "feature_slugs": ["private-pool", "breakfast-included", "air-conditioning", "wifi", "ocean-view", "beachfront", "daily-cleaning", "couple-friendly"],
        "is_featured": True,
    },
    {
        "title_sw": "Apartment ya Masaki - Dar es Salaam",
        "description_sw": "Apartment ya kibiashara katika eneo la Masaki. Karibu na maeneo ya biashara na mikahawa bora.",
        "location": "Masaki",
        "country": "Tanzania", "region": "Dar es Salaam", "town": "Dar es Salaam",
        "listing_type": "apartment",
        "category_slug": "serviced-apartment", "type_name": "Executive Serviced Apartment",
        "price_per_night": decimal.Decimal("25000"),
        "base_currency": "KES",
        "price_tier": "premium", "stay_style": "corporate",
        "bedrooms": 2, "beds": 2, "bathrooms": 2, "max_guests": 3,
        "amenities": ["WiFi ya kasi", "Jiko", "Gym", "Ulinzi", "Parking"],
        "feature_slugs": ["wifi", "kitchen", "gym", "security", "parking", "work-friendly", "workspace", "near-cbd"],
        "is_featured": False,
    },
    {
        "title_sw": "Hotel Boutique - Diani",
        "description_sw": "Hotel ndogo ya kifahari mita 200 kutoka baharini. Chakula cha asubuhi na chakula cha jioni zimejumuishwa.",
        "location": "Diani Beach",
        "country": "Kenya", "region": "Kwale", "town": "Diani",
        "listing_type": "hotel",
        "category_slug": "hotel", "type_name": "Deluxe Room",
        "price_per_night": decimal.Decimal("11500"),
        "base_currency": "KES",
        "price_tier": "premium", "stay_style": "couple",
        "bedrooms": 1, "beds": 1, "bathrooms": 1, "max_guests": 2,
        "amenities": ["Breakfast & Dinner", "Pool", "Beach Access", "WiFi", "AC", "Bar"],
        "feature_slugs": ["breakfast-included", "swimming-pool", "near-beach", "wifi", "air-conditioning", "couple-friendly", "all-inclusive"],
        "is_featured": False,
    },
]

PACKAGES = [
    {
        "name": "Coastal Escape – Diani 3 Usiku",
        "slug": "coastal-escape-diani-3-nights",
        "package_type": "airport-pickup-stay",
        "description": "Furahia siku 3 za starehe Diani Beach. Pickup ya uwanja wa ndege wa Moi imejumuishwa.",
        "duration_label": "3 Usiku / 4 Siku",
        "price_from": decimal.Decimal("32000"),
        "includes": "Usafiri wa uwanja wa ndege • Malazi ya hoteli au villa • Chakula cha asubuhi kila siku • Ziara ya pwani",
        "transport_included": True,
        "meals_included": True,
    },
    {
        "name": "Zanzibar Ferry & Stay – 4 Usiku",
        "slug": "zanzibar-ferry-stay-4-nights",
        "package_type": "zanzibar-ferry-stay",
        "description": "Tembelea kisiwa cha Zanzibar. Tiketi ya feri na malazi ya Stone Town au Nungwi zimejumuishwa.",
        "duration_label": "4 Usiku / 5 Siku",
        "price_from": decimal.Decimal("58000"),
        "includes": "Tiketi ya feri ya pande zote • Malazi 4 usiku • Chakula cha asubuhi • Ziara ya Stone Town",
        "transport_included": True,
        "meals_included": True,
    },
    {
        "name": "Executive Business Stay – Dar es Salaam",
        "slug": "executive-business-stay-dar",
        "package_type": "executive-business-stay",
        "description": "Kaa vizuri unapotembelea Dar es Salaam kwa biashara. WiFi ya kasi, eneo la kufanyia kazi, na VIP pickup.",
        "duration_label": "2–7 Usiku",
        "price_from": decimal.Decimal("15000"),
        "includes": "VIP Meet & Greet • Malazi ya executive • WiFi ya Kasi • Eneo la Kufanyia Kazi • Chakula cha asubuhi",
        "transport_included": True,
        "meals_included": False,
    },
    {
        "name": "Beach Holiday – Watamu 5 Usiku",
        "slug": "beach-holiday-watamu-5-nights",
        "package_type": "beach-holiday-packages",
        "description": "Pumzika kwenye fukwe za Watamu. Kayaking, snorkeling na mapango ya bahari yanapatikana.",
        "duration_label": "5 Usiku / 6 Siku",
        "price_from": decimal.Decimal("44000"),
        "includes": "Malazi ya BnB • Chakula cha asubuhi • Snorkeling • Ziara ya Watamu Marine Park",
        "transport_included": False,
        "meals_included": True,
    },
    {
        "name": "Weekend Getaway – Mombasa SGR",
        "slug": "weekend-getaway-mombasa-sgr",
        "package_type": "mombasa-sgr-stay",
        "description": "Safiri Nairobi hadi Mombasa kwa SGR, kaa hoteli ya pwani wikendi nzima.",
        "duration_label": "2 Usiku / 3 Siku",
        "price_from": decimal.Decimal("18500"),
        "includes": "Tiketi ya SGR (kwenda) • Malazi 2 usiku • Chakula cha asubuhi",
        "transport_included": True,
        "meals_included": True,
    },
]


class Command(BaseCommand):
    help = "Seed database with demo properties (with full taxonomy) and travel packages"

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Remove existing demo/seed data before inserting",
        )
        parser.add_argument(
            "--host-email",
            type=str,
            default="",
            help="Email of existing user to set as property host (default: first superuser)",
        )

    def handle(self, *args, **options):
        from properties.models import Property, PropertyCategory, PropertyType, PropertyFeature
        from packages.models import TravelPackage

        # ── Resolve host user ──────────────────────────────────────────────
        host_email = options["host_email"].strip()
        if host_email:
            try:
                host = User.objects.get(email__iexact=host_email)
            except User.DoesNotExist:
                raise CommandError(f"No user found with email '{host_email}'.")
        else:
            host = User.objects.filter(is_superuser=True).first()
            if not host:
                host = User.objects.filter(is_staff=True).first()
            if not host:
                raise CommandError(
                    "No superuser found. Create one first:\n"
                    "  python manage.py createsuperuser\n"
                    "Or pass --host-email <email>"
                )

        self.stdout.write(f"Using host: {host.email} (id={host.pk})")

        # ── Optionally clear ───────────────────────────────────────────────
        if options["clear"]:
            deleted_props, _ = Property.objects.filter(host=host).delete()
            deleted_pkgs, _ = TravelPackage.objects.filter(
                slug__in=[p["slug"] for p in PACKAGES]
            ).delete()
            self.stdout.write(
                self.style.WARNING(f"Cleared {deleted_props} properties and {deleted_pkgs} packages.")
            )

        # ── Pre-load taxonomy lookups ──────────────────────────────────────
        categories = {c.slug: c for c in PropertyCategory.objects.filter(is_active=True)}
        features_by_slug = {f.slug: f for f in PropertyFeature.objects.filter(is_active=True)}

        if not categories:
            self.stdout.write(
                self.style.WARNING(
                    "No categories found. Run 'python manage.py seed_stay_types' first, "
                    "or run 'python manage.py migrate' to apply the data migration."
                )
            )

        # ── Seed properties ────────────────────────────────────────────────
        created_props = 0
        for data in PROPERTIES:
            title = data["title_sw"]
            if Property.objects.filter(title_sw=title, host=host).exists():
                self.stdout.write(f"  skip property (exists): {title}")
                continue

            # Resolve category + type
            cat_slug = data.pop("category_slug", None)
            type_name = data.pop("type_name", None)
            feature_slugs = data.pop("feature_slugs", [])
            base_currency = data.pop("base_currency", "KES")

            category = categories.get(cat_slug) if cat_slug else None
            property_type = None
            if category and type_name:
                property_type = (
                    PropertyType.objects
                    .filter(category=category, name=type_name)
                    .first()
                )

            prop = Property.objects.create(
                host=host,
                approval_status=Property.ApprovalStatus.APPROVED,
                is_active=True,
                category=category,
                property_type=property_type,
                base_currency=base_currency,
                **data,
            )

            # Attach features
            matched_features = [
                features_by_slug[slug]
                for slug in feature_slugs
                if slug in features_by_slug
            ]
            if matched_features:
                prop.features.set(matched_features)

            created_props += 1
            self.stdout.write(
                self.style.SUCCESS(
                    f"  [OK] {title} "
                    f"[{category.name if category else '?'} / {property_type.name if property_type else '?'}] "
                    f"({len(matched_features)} features)"
                )
            )

        # ── Seed packages ──────────────────────────────────────────────────
        created_pkgs = 0
        for pkg_data in PACKAGES:
            slug = pkg_data["slug"]
            if TravelPackage.objects.filter(slug=slug).exists():
                self.stdout.write(f"  skip package (exists): {pkg_data['name']}")
                continue
            TravelPackage.objects.create(is_active=True, **pkg_data)
            created_pkgs += 1
            self.stdout.write(self.style.SUCCESS(f"  [OK] package: {pkg_data['name']}"))

        self.stdout.write(
            self.style.SUCCESS(
                f"\nDone! Created {created_props} properties and {created_pkgs} packages."
            )
        )
        if created_props > 0:
            self.stdout.write(
                "NOTE: Properties are set to 'approved' and will appear on the site immediately."
            )
