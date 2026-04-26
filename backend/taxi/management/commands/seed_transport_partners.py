from django.core.management.base import BaseCommand

from taxi.models import TransportPartner


class Command(BaseCommand):
    help = "Seed external transport partners for taxi comparison cards"

    def add_arguments(self, parser):
        parser.add_argument("--clear", action="store_true", help="Clear existing partners before seeding")

    def handle(self, *args, **options):
        if options["clear"]:
            deleted_count = TransportPartner.objects.all().delete()[0]
            self.stdout.write(self.style.WARNING(f"Deleted {deleted_count} existing transport partners"))

        partners = [
            {
                "name": "Uber",
                "region": "Kenya",
                "city": "Mombasa",
                "service_type": "ride_app",
                "logo_url": "https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png",
                "booking_url": "https://m.uber.com/",
                "description": "Best for city rides and airport transfers where Uber is available.",
                "is_external": True,
                "is_featured": True,
                "priority": 10,
            },
            {
                "name": "Bolt",
                "region": "Kenya",
                "city": "Mombasa",
                "service_type": "ride_app",
                "logo_url": "https://upload.wikimedia.org/wikipedia/commons/1/17/Bolt_logo.png",
                "booking_url": "https://bolt.eu/en-ke/",
                "description": "Affordable ride-hailing option for local city movement.",
                "is_external": True,
                "is_featured": True,
                "priority": 20,
            },
            {
                "name": "Farasi Local Taxi",
                "region": "Kenya",
                "city": "Diani",
                "service_type": "local_taxi",
                "logo_url": "",
                "booking_url": "",
                "whatsapp_number": "+254700000000",
                "description": "Good for Diani, Ukunda, Watamu, Malindi and local coastal transfers.",
                "is_external": True,
                "is_featured": True,
                "priority": 30,
            },
            {
                "name": "Karibu Private Transfer",
                "region": "Kenya",
                "city": "Mombasa",
                "service_type": "private_transfer",
                "logo_url": "",
                "booking_url": "",
                "whatsapp_number": "+254700000000",
                "description": "Pre-booked SGR, airport, hotel, family and group transfers.",
                "is_external": False,
                "is_featured": True,
                "priority": 40,
            },
            {
                "name": "Zanzibar Airport Transfer",
                "region": "Tanzania",
                "city": "Zanzibar",
                "service_type": "airport_transfer",
                "logo_url": "",
                "booking_url": "",
                "whatsapp_number": "+255700000000",
                "description": "Private airport and ferry transfers to Stone Town, Nungwi, Paje and Kendwa.",
                "is_external": True,
                "is_featured": True,
                "priority": 50,
            },
        ]

        created_count = 0
        updated_count = 0
        for partner in partners:
            obj, created = TransportPartner.objects.update_or_create(
                name=partner["name"],
                city=partner["city"],
                defaults=partner,
            )
            if created:
                created_count += 1
            else:
                updated_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Seeded transport partners: {created_count} created, {updated_count} updated"
            )
        )
