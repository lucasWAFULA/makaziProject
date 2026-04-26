import csv
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError

from destinations.models import Destination
from properties.models import Property


class Command(BaseCommand):
    help = "Import property->destination mappings from a CSV file."

    def add_arguments(self, parser):
        parser.add_argument(
            "csv_path",
            help="Path to CSV file with mappings.",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Preview changes without saving.",
        )
        parser.add_argument(
            "--overwrite",
            action="store_true",
            help="Overwrite existing destination mapping on properties.",
        )
        parser.add_argument(
            "--strict",
            action="store_true",
            help="Stop on first row error instead of skipping.",
        )

    def handle(self, *args, **options):
        csv_path = Path(options["csv_path"])
        dry_run = options["dry_run"]
        overwrite = options["overwrite"]
        strict = options["strict"]

        if not csv_path.exists():
            raise CommandError(f"CSV file not found: {csv_path}")

        processed = 0
        updated = 0
        skipped = 0
        errors = 0

        with csv_path.open("r", encoding="utf-8-sig", newline="") as fh:
            reader = csv.DictReader(fh)
            if not reader.fieldnames:
                raise CommandError("CSV has no header row.")

            for row_no, row in enumerate(reader, start=2):
                processed += 1
                try:
                    prop = self._resolve_property(row)
                    if not prop:
                        raise ValueError("Property not found.")
                    if prop.destination_id and not overwrite:
                        skipped += 1
                        self.stdout.write(f"[SKIP row {row_no}] property#{prop.id} already mapped (use --overwrite).")
                        continue

                    destination = self._resolve_destination(row)
                    if not destination:
                        raise ValueError("Destination not found.")

                    self.stdout.write(
                        f"[MAP row {row_no}] property#{prop.id} '{prop.title_sw}' -> "
                        f"{destination.destination_name}, {destination.region}, {destination.country}"
                    )
                    if not dry_run:
                        prop.destination = destination
                        prop.country = destination.country
                        prop.region = destination.region
                        prop.town = destination.destination_name
                        prop.save(update_fields=["destination", "country", "region", "town", "updated_at"])
                    updated += 1
                except Exception as exc:
                    errors += 1
                    msg = f"[ERROR row {row_no}] {exc}"
                    if strict:
                        raise CommandError(msg) from exc
                    self.stdout.write(self.style.WARNING(msg))

        self.stdout.write(
            self.style.SUCCESS(
                f"Processed={processed} updated={updated} skipped={skipped} errors={errors} dry_run={dry_run}"
            )
        )

    def _resolve_property(self, row):
        property_id = (row.get("property_id") or "").strip()
        title = (row.get("property_title") or row.get("title_sw") or "").strip()

        if property_id:
            try:
                return Property.objects.filter(pk=int(property_id)).first()
            except ValueError:
                raise ValueError(f"Invalid property_id '{property_id}'.")
        if title:
            qs = Property.objects.filter(title_sw__iexact=title).order_by("id")
            match = qs.first()
            if not match:
                return None
            if qs.count() > 1:
                raise ValueError(f"Multiple properties found for title '{title}'. Use property_id.")
            return match
        raise ValueError("Missing property identifier (property_id or property_title).")

    def _resolve_destination(self, row):
        destination_id = (row.get("destination_id") or "").strip()
        destination_slug = (row.get("destination_slug") or "").strip()
        country = (row.get("country") or "").strip()
        region = (row.get("region") or "").strip()
        destination_name = (row.get("destination_name") or "").strip()

        if destination_id:
            try:
                return Destination.objects.filter(destination_id=int(destination_id), is_active=True).first()
            except ValueError:
                raise ValueError(f"Invalid destination_id '{destination_id}'.")

        if destination_slug:
            return Destination.objects.filter(destination_slug=destination_slug, is_active=True).first()

        if country and region and destination_name:
            return Destination.objects.filter(
                country__iexact=country,
                region__iexact=region,
                destination_name__iexact=destination_name,
                is_active=True,
            ).first()

        raise ValueError(
            "Missing destination identifier. Provide destination_id or destination_slug or country+region+destination_name."
        )
