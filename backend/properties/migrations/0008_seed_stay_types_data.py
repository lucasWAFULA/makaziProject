"""
Data migration: seed all PropertyCategory, PropertyType, and PropertyFeature rows.
Covers all 18 categories from the MakaziPlus production spec.
"""

from django.db import migrations
from django.utils.text import slugify

# ── Full category + type catalogue ────────────────────────────────────────────
CATEGORIES = [
    {
        "name": "Apartment", "slug": "apartment", "icon": "🏢", "order": 1,
        "types": [
            "Studio Apartment", "Bedsitter Apartment", "1 Bedroom Apartment",
            "2 Bedroom Apartment", "3 Bedroom Apartment", "4 Bedroom Apartment",
            "5 Bedroom Apartment", "Penthouse Apartment", "Maisonette Apartment",
            "Duplex Apartment", "Loft Apartment", "Family Apartment",
            "Executive Apartment", "Luxury Apartment",
        ],
    },
    {
        "name": "BnB", "slug": "bnb", "icon": "🛏️", "order": 2,
        "types": [
            "Studio BnB", "Bedsitter BnB", "1 Bedroom BnB", "2 Bedroom BnB",
            "3 Bedroom BnB", "4 Bedroom BnB", "5 Bedroom BnB", "Shared BnB",
            "Luxury BnB", "Beachfront BnB", "Executive BnB", "Family BnB", "Budget BnB",
        ],
    },
    {
        "name": "Hotel", "slug": "hotel", "icon": "🏨", "order": 3,
        "types": [
            "Single Room", "Double Room", "Twin Room", "Triple Room", "Queen Room",
            "King Room", "Deluxe Room", "Executive Room", "Family Room",
            "Junior Suite", "Executive Suite", "Presidential Suite",
            "Ocean View Room", "Garden View Room", "City View Room", "Honeymoon Suite",
        ],
    },
    {
        "name": "Villa", "slug": "villa", "icon": "🏡", "order": 4,
        "types": [
            "2 Bedroom Villa", "3 Bedroom Villa", "4 Bedroom Villa", "5 Bedroom Villa",
            "6 Bedroom Villa", "Luxury Villa", "Beach Villa", "Private Pool Villa",
            "Family Villa", "Executive Villa", "Garden Villa", "Oceanfront Villa",
            "Safari Villa",
        ],
    },
    {
        "name": "Guest House", "slug": "guest-house", "icon": "🏠", "order": 5,
        "types": [
            "Single Guest Room", "Double Guest Room", "Family Guest Room",
            "Budget Guest Room", "Executive Guest Room", "Shared Guest Room",
        ],
    },
    {
        "name": "Resort", "slug": "resort", "icon": "🌴", "order": 6,
        "types": [
            "Beach Resort Room", "Luxury Resort Suite", "Family Resort Suite",
            "Private Resort Villa", "Safari Resort Tent", "Waterfront Resort Room",
        ],
    },
    {
        "name": "Lodge", "slug": "lodge", "icon": "🌿", "order": 7,
        "types": [
            "Safari Lodge", "Eco Lodge", "Mountain Lodge", "Beach Lodge",
            "Luxury Lodge", "Family Lodge", "Budget Lodge",
        ],
    },
    {
        "name": "Hostel", "slug": "hostel", "icon": "🎒", "order": 8,
        "types": [
            "Dormitory Bed", "Mixed Dorm", "Female Dorm", "Male Dorm",
            "Private Hostel Room", "Budget Hostel Room", "Backpacker Room",
        ],
    },
    {
        "name": "Serviced Apartment", "slug": "serviced-apartment", "icon": "🏙️", "order": 9,
        "types": [
            "Studio Serviced Apartment", "1 Bedroom Serviced Apartment",
            "2 Bedroom Serviced Apartment", "Executive Serviced Apartment",
            "Luxury Serviced Apartment", "Long Stay Apartment",
        ],
    },
    {
        "name": "Vacation Home", "slug": "vacation-home", "icon": "🏖️", "order": 10,
        "types": [
            "Family Vacation Home", "Beach Vacation Home", "Luxury Vacation Home",
            "Private Vacation Home", "Group Vacation Home",
        ],
    },
    {
        "name": "Beach House", "slug": "beach-house", "icon": "🌊", "order": 11,
        "types": [
            "1 Bedroom Beach House", "2 Bedroom Beach House", "3 Bedroom Beach House",
            "Luxury Beach House", "Private Beach House", "Ocean View Beach House",
        ],
    },
    {
        "name": "Safari Camp", "slug": "safari-camp", "icon": "⛺", "order": 12,
        "types": [
            "Luxury Tent", "Safari Tent", "Family Safari Tent",
            "Private Safari Camp", "Eco Safari Camp",
        ],
    },
    {
        "name": "Cottage", "slug": "cottage", "icon": "🌸", "order": 13,
        "types": [
            "Garden Cottage", "Beach Cottage", "Luxury Cottage",
            "Family Cottage", "Eco Cottage",
        ],
    },
    {
        "name": "Cabin", "slug": "cabin", "icon": "🪵", "order": 14,
        "types": [
            "Wooden Cabin", "Mountain Cabin", "Luxury Cabin",
            "Eco Cabin", "Family Cabin",
        ],
    },
    {
        "name": "Camping Site", "slug": "camping-site", "icon": "🏕️", "order": 15,
        "types": [
            "Camping Tent", "Luxury Camping Tent", "Group Camping Site",
            "Private Camping Site", "Backpacker Camping",
        ],
    },
    {
        "name": "Shared Stay", "slug": "shared-stay", "icon": "🤝", "order": 16,
        "types": [
            "Shared Room", "Shared Apartment", "Shared House",
            "Shared Hostel", "Co-living Space",
        ],
    },
    {
        "name": "Penthouse", "slug": "penthouse", "icon": "🌆", "order": 17,
        "types": [
            "Studio Penthouse", "1 Bedroom Penthouse", "2 Bedroom Penthouse",
            "3 Bedroom Penthouse", "Luxury Penthouse", "Sky Penthouse",
            "Duplex Penthouse",
        ],
    },
    {
        "name": "Farm Stay", "slug": "farm-stay", "icon": "🌾", "order": 18,
        "types": [
            "Farm Cottage", "Farm House", "Eco Farm Stay",
            "Luxury Farm Stay", "Agri-tourism Stay",
        ],
    },
]

# ── Feature catalogue ──────────────────────────────────────────────────────────
FEATURES = [
    # Location
    {"name": "Beachfront",     "slug": "beachfront",     "group": "location", "icon": "🏖️", "order": 1},
    {"name": "Ocean View",     "slug": "ocean-view",     "group": "location", "icon": "🌊", "order": 2},
    {"name": "City View",      "slug": "city-view",      "group": "location", "icon": "🌆", "order": 3},
    {"name": "Mountain View",  "slug": "mountain-view",  "group": "location", "icon": "⛰️", "order": 4},
    {"name": "Garden View",    "slug": "garden-view",    "group": "location", "icon": "🌿", "order": 5},
    {"name": "Lake View",      "slug": "lake-view",      "group": "location", "icon": "🏞️", "order": 6},
    {"name": "Near Airport",   "slug": "near-airport",   "group": "location", "icon": "✈️", "order": 7},
    {"name": "Near Beach",     "slug": "near-beach",     "group": "location", "icon": "🌴", "order": 8},
    {"name": "Near CBD",       "slug": "near-cbd",       "group": "location", "icon": "🏙️", "order": 9},
    {"name": "Near SGR",       "slug": "near-sgr",       "group": "location", "icon": "🚂", "order": 10},
    # Property
    {"name": "Swimming Pool",      "slug": "swimming-pool",      "group": "property", "icon": "🏊", "order": 1},
    {"name": "Private Pool",       "slug": "private-pool",       "group": "property", "icon": "🏊", "order": 2},
    {"name": "WiFi",               "slug": "wifi",               "group": "property", "icon": "📶", "order": 3},
    {"name": "Air Conditioning",   "slug": "air-conditioning",   "group": "property", "icon": "❄️", "order": 4},
    {"name": "Parking",            "slug": "parking",            "group": "property", "icon": "🅿️", "order": 5},
    {"name": "Kitchen",            "slug": "kitchen",            "group": "property", "icon": "🍳", "order": 6},
    {"name": "Workspace",          "slug": "workspace",          "group": "property", "icon": "💻", "order": 7},
    {"name": "Balcony",            "slug": "balcony",            "group": "property", "icon": "🌅", "order": 8},
    {"name": "Smart TV",           "slug": "smart-tv",           "group": "property", "icon": "📺", "order": 9},
    {"name": "Gym",                "slug": "gym",                "group": "property", "icon": "💪", "order": 10},
    {"name": "Elevator",           "slug": "elevator",           "group": "property", "icon": "🛗", "order": 11},
    {"name": "Security",           "slug": "security",           "group": "property", "icon": "🔒", "order": 12},
    {"name": "Backup Generator",   "slug": "backup-generator",   "group": "property", "icon": "⚡", "order": 13},
    # Experience
    {"name": "Family Friendly",  "slug": "family-friendly",  "group": "experience", "icon": "👨‍👩‍👧", "order": 1},
    {"name": "Couple Friendly",  "slug": "couple-friendly",  "group": "experience", "icon": "💑",   "order": 2},
    {"name": "Pet Friendly",     "slug": "pet-friendly",     "group": "experience", "icon": "🐾",   "order": 3},
    {"name": "Work Friendly",    "slug": "work-friendly",    "group": "experience", "icon": "💼",   "order": 4},
    {"name": "Party Friendly",   "slug": "party-friendly",   "group": "experience", "icon": "🎉",   "order": 5},
    {"name": "Long Stay",        "slug": "long-stay",        "group": "experience", "icon": "📅",   "order": 6},
    {"name": "Short Stay",       "slug": "short-stay",       "group": "experience", "icon": "⏱️",  "order": 7},
    {"name": "Self Check-in",    "slug": "self-check-in",    "group": "experience", "icon": "🗝️",  "order": 8},
    # Service
    {"name": "Airport Pickup",    "slug": "airport-pickup",    "group": "service", "icon": "🚐", "order": 1},
    {"name": "Private Chef",      "slug": "private-chef",      "group": "service", "icon": "👨‍🍳", "order": 2},
    {"name": "Tour Guide",        "slug": "tour-guide",        "group": "service", "icon": "🗺️", "order": 3},
    {"name": "Car Rental",        "slug": "car-rental",        "group": "service", "icon": "🚗", "order": 4},
    {"name": "Laundry Service",   "slug": "laundry-service",   "group": "service", "icon": "👕", "order": 5},
    {"name": "Daily Cleaning",    "slug": "daily-cleaning",    "group": "service", "icon": "🧹", "order": 6},
    {"name": "Breakfast Included","slug": "breakfast-included","group": "service", "icon": "🍳", "order": 7},
    {"name": "All Inclusive",     "slug": "all-inclusive",     "group": "service", "icon": "⭐", "order": 8},
]


def seed_forward(apps, schema_editor):
    PropertyCategory = apps.get_model("properties", "PropertyCategory")
    PropertyType = apps.get_model("properties", "PropertyType")
    PropertyFeature = apps.get_model("properties", "PropertyFeature")

    # Seed categories and types
    for cat_data in CATEGORIES:
        types = cat_data.pop("types")
        cat, _ = PropertyCategory.objects.get_or_create(
            slug=cat_data["slug"],
            defaults=cat_data,
        )
        for i, type_name in enumerate(types):
            type_slug = slugify(type_name)
            PropertyType.objects.get_or_create(
                category=cat,
                slug=type_slug,
                defaults={"name": type_name, "order": i + 1},
            )

    # Seed features
    for feat_data in FEATURES:
        PropertyFeature.objects.get_or_create(
            slug=feat_data["slug"],
            defaults={
                "name": feat_data["name"],
                "feature_group": feat_data["group"],
                "icon": feat_data["icon"],
                "order": feat_data["order"],
            },
        )


def seed_reverse(apps, schema_editor):
    PropertyCategory = apps.get_model("properties", "PropertyCategory")
    PropertyFeature = apps.get_model("properties", "PropertyFeature")
    PropertyCategory.objects.all().delete()
    PropertyFeature.objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ("properties", "0007_property_categories_types_features"),
    ]

    operations = [
        migrations.RunPython(seed_forward, seed_reverse),
    ]
