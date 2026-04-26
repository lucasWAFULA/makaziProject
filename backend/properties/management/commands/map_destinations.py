from django.core.management.base import BaseCommand

from properties.models import Property
from properties.destination_mapping import infer_destination_for_property
from destinations.models import Destination


class Command(BaseCommand):
    help = "Auto-map properties to destinations using town/location text."

    def add_arguments(self, parser):
        parser.add_argument("--dry-run", action="store_true", help="Preview matches without saving.")
        parser.add_argument(
            "--overwrite",
            action="store_true",
            help="Re-map properties that already have a destination.",
        )
        parser.add_argument(
            "--limit",
            type=int,
            default=0,
            help="Process only first N properties (0 means all).",
        )

    def handle(self, *args, **options):
        dry_run = options["dry_run"]
        overwrite = options["overwrite"]
        limit = options["limit"]

        destinations = list(Destination.objects.filter(is_active=True))
        if not destinations:
            self.stdout.write(self.style.WARNING("No active destinations found."))
            return

        qs = Property.objects.all().order_by("id")
        if not overwrite:
            qs = qs.filter(destination__isnull=True)
        if limit and limit > 0:
            qs = qs[:limit]

        total = 0
        matched = 0
        skipped = 0

        for prop in qs:
            total += 1
            match = infer_destination_for_property(prop, destinations=destinations)
            if not match:
                skipped += 1
                continue

            matched += 1
            self.stdout.write(
                f"[MATCH] property#{prop.id} '{prop.title_sw}' -> {match.destination_name}, {match.region}, {match.country}"
            )
            if dry_run:
                continue

            prop.destination = match
            prop.country = match.country
            prop.region = match.region
            prop.town = match.destination_name
            prop.save(update_fields=["destination", "country", "region", "town", "updated_at"])

        summary = f"Processed={total} matched={matched} skipped={skipped} dry_run={dry_run}"
        self.stdout.write(self.style.SUCCESS(summary))
