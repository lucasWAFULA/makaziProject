from django.db import migrations
from django.utils.text import slugify


DESTINATIONS = [
    # Kenya - Mombasa County
    ("Kenya", "Mombasa", "Mombasa", "city", "family", True),
    ("Kenya", "Mombasa", "Nyali", "beach", "family", True),
    ("Kenya", "Mombasa", "Bamburi", "beach", "family", False),
    ("Kenya", "Mombasa", "Shanzu", "beach", "beach", False),
    ("Kenya", "Mombasa", "Mtwapa", "coastal-town", "budget", False),
    ("Kenya", "Mombasa", "Tudor", "city", "budget", False),
    ("Kenya", "Mombasa", "Kizingo", "city", "luxury", False),
    ("Kenya", "Mombasa", "Likoni", "city", "budget", False),
    ("Kenya", "Mombasa", "Shelly Beach", "beach", "beach", False),
    ("Kenya", "Mombasa", "Old Town", "historic", "adventure", False),
    ("Kenya", "Mombasa", "Mama Ngina Waterfront", "waterfront", "family", False),
    ("Kenya", "Mombasa", "Haller Park", "nature", "adventure", False),
    ("Kenya", "Mombasa", "Pirates Beach", "beach", "beach", False),
    # Kenya - Kwale County
    ("Kenya", "Kwale", "Diani Beach", "beach", "beach", True),
    ("Kenya", "Kwale", "Tiwi", "beach", "family", False),
    ("Kenya", "Kwale", "Galu", "beach", "honeymoon", False),
    ("Kenya", "Kwale", "Msambweni", "coastal-town", "adventure", False),
    ("Kenya", "Kwale", "Shimoni", "coastal-town", "adventure", False),
    ("Kenya", "Kwale", "Wasini Island", "island", "adventure", False),
    ("Kenya", "Kwale", "Funzi Island", "island", "honeymoon", False),
    ("Kenya", "Kwale", "Chale Island", "island", "honeymoon", False),
    # Kenya - Kilifi County
    ("Kenya", "Kilifi", "Kilifi Town", "coastal-town", "family", False),
    ("Kenya", "Kilifi", "Watamu", "beach", "beach", True),
    ("Kenya", "Kilifi", "Malindi", "coastal-town", "beach", True),
    ("Kenya", "Kilifi", "Mambrui", "beach", "budget", False),
    ("Kenya", "Kilifi", "Vipingo", "beach", "luxury", False),
    ("Kenya", "Kilifi", "Kuruwitu", "beach", "adventure", False),
    ("Kenya", "Kilifi", "Bofa Beach", "beach", "family", False),
    ("Kenya", "Kilifi", "Kilifi Creek", "waterfront", "adventure", False),
    # Kenya - Lamu County
    ("Kenya", "Lamu", "Lamu Town", "historic", "adventure", True),
    ("Kenya", "Lamu", "Shela", "beach", "honeymoon", True),
    ("Kenya", "Lamu", "Manda Island", "island", "luxury", False),
    ("Kenya", "Lamu", "Kiwayu", "island", "adventure", False),
    ("Kenya", "Lamu", "Takwa", "historic", "adventure", False),
    ("Kenya", "Lamu", "Kipungani", "beach", "luxury", False),
    # Kenya - Tana River Coastline
    ("Kenya", "Tana River", "Kipini", "coastal-town", "adventure", False),
    ("Kenya", "Tana River", "Delta Eco Areas", "nature", "adventure", False),
    # Tanzania - Zanzibar (Unguja)
    ("Tanzania", "Zanzibar", "Stone Town", "historic", "budget", True),
    ("Tanzania", "Zanzibar", "Nungwi", "beach", "beach", True),
    ("Tanzania", "Zanzibar", "Kendwa", "beach", "beach", False),
    ("Tanzania", "Zanzibar", "Paje", "beach", "beach", True),
    ("Tanzania", "Zanzibar", "Jambiani", "beach", "beach", False),
    ("Tanzania", "Zanzibar", "Matemwe", "beach", "honeymoon", False),
    ("Tanzania", "Zanzibar", "Kiwengwa", "beach", "family", False),
    ("Tanzania", "Zanzibar", "Bwejuu", "beach", "honeymoon", False),
    ("Tanzania", "Zanzibar", "Fumba", "coastal-town", "adventure", False),
    # Tanzania - Pemba
    ("Tanzania", "Pemba", "Wete", "coastal-town", "family", False),
    ("Tanzania", "Pemba", "Chake Chake", "coastal-town", "family", False),
    ("Tanzania", "Pemba", "Misali Island", "island", "adventure", False),
    # Tanzania - Dar es Salaam
    ("Tanzania", "Dar es Salaam", "Dar es Salaam", "city", "family", True),
    ("Tanzania", "Dar es Salaam", "Masaki", "city", "luxury", False),
    ("Tanzania", "Dar es Salaam", "Oysterbay", "city", "luxury", False),
    ("Tanzania", "Dar es Salaam", "Mikocheni", "city", "family", False),
    ("Tanzania", "Dar es Salaam", "Msasani", "city", "luxury", False),
    ("Tanzania", "Dar es Salaam", "Kigamboni", "beach", "family", True),
    ("Tanzania", "Dar es Salaam", "Coco Beach", "beach", "family", False),
    ("Tanzania", "Dar es Salaam", "City Centre", "city", "budget", False),
    # Tanzania - Bagamoyo
    ("Tanzania", "Bagamoyo", "Historic Town", "historic", "adventure", False),
    ("Tanzania", "Bagamoyo", "Bagamoyo Beach Resorts", "beach", "family", False),
    # Tanzania - Tanga
    ("Tanzania", "Tanga", "Tanga Town", "coastal-town", "family", False),
    ("Tanzania", "Tanga", "Pangani", "beach", "adventure", False),
    ("Tanzania", "Tanga", "Ushongo Beach", "beach", "beach", False),
    ("Tanzania", "Tanga", "Amboni Caves Area", "nature", "adventure", False),
    # Tanzania - Mafia Island
    ("Tanzania", "Mafia Island", "Mafia Island", "island", "adventure", True),
    ("Tanzania", "Mafia Island", "Kilindoni", "coastal-town", "adventure", False),
    ("Tanzania", "Mafia Island", "Mafia Marine Park", "nature", "adventure", False),
    ("Tanzania", "Mafia Island", "Diving Resorts", "beach", "adventure", False),
    # Tanzania - Mtwara
    ("Tanzania", "Mtwara", "Mikindani", "coastal-town", "adventure", False),
    ("Tanzania", "Mtwara", "Mnazi Bay", "nature", "adventure", False),
]


def seed_destinations(apps, schema_editor):
    Destination = apps.get_model("destinations", "Destination")
    for country, region, name, destination_type, category, featured in DESTINATIONS:
        slug = slugify(f"{country}-{region}-{name}")[:180]
        Destination.objects.update_or_create(
            country=country,
            region=region,
            destination_name=name,
            defaults={
                "destination_slug": slug,
                "destination_type": destination_type,
                "tourism_category": category,
                "is_featured": featured,
                "is_active": True,
            },
        )


def unseed_destinations(apps, schema_editor):
    Destination = apps.get_model("destinations", "Destination")
    for country, region, name, *_ in DESTINATIONS:
        Destination.objects.filter(country=country, region=region, destination_name=name).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("destinations", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_destinations, unseed_destinations),
    ]
