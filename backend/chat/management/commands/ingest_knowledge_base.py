import json

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from chat.models import KnowledgeBase

try:
    from openai import OpenAI
except Exception:  # pragma: no cover
    OpenAI = None


class Command(BaseCommand):
    help = "Ingest and embed KnowledgeBase records from JSON file."

    def add_arguments(self, parser):
        parser.add_argument(
            "--file",
            required=True,
            help="Path to JSON file containing list of knowledge records.",
        )
        parser.add_argument(
            "--model",
            default="text-embedding-3-small",
            help="OpenAI embedding model to use.",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Validate and preview without writing to database.",
        )

    def handle(self, *args, **options):
        if not settings.OPENAI_API_KEY:
            raise CommandError("OPENAI_API_KEY is not configured.")
        if OpenAI is None:
            raise CommandError("openai package is not available.")

        file_path = options["file"]
        dry_run = options["dry_run"]
        model = options["model"]

        try:
            with open(file_path, "r", encoding="utf-8") as handle:
                payload = json.load(handle)
        except OSError as exc:
            raise CommandError(f"Could not read file: {exc}") from exc
        except json.JSONDecodeError as exc:
            raise CommandError(f"Invalid JSON file: {exc}") from exc

        if not isinstance(payload, list):
            raise CommandError("JSON payload must be a list of records.")

        client = OpenAI(api_key=settings.OPENAI_API_KEY)
        created = 0
        updated = 0

        @transaction.atomic
        def _ingest():
            nonlocal created, updated
            for idx, item in enumerate(payload, start=1):
                title = str(item.get("title") or "").strip()
                category = str(item.get("category") or "").strip() or "general"
                content = str(item.get("content") or "").strip()
                country = str(item.get("country") or "").strip()
                region = str(item.get("region") or "").strip()
                is_active = bool(item.get("is_active", True))
                if not title or not content:
                    self.stdout.write(self.style.WARNING(f"Skipping record #{idx}: title/content required"))
                    continue

                emb = client.embeddings.create(
                    model=model,
                    input=f"{title}\n{content}",
                )
                vector = emb.data[0].embedding

                obj, is_created = KnowledgeBase.objects.update_or_create(
                    title=title,
                    defaults={
                        "category": category,
                        "content": content,
                        "country": country,
                        "region": region,
                        "is_active": is_active,
                        "embedding": vector,
                    },
                )
                if is_created:
                    created += 1
                else:
                    updated += 1
                self.stdout.write(f"Ingested: {obj.title}")

            if dry_run:
                raise RuntimeError("Dry run requested; rolling back transaction.")

        try:
            _ingest()
        except RuntimeError as exc:
            if dry_run:
                self.stdout.write(self.style.WARNING(str(exc)))
            else:
                raise CommandError(str(exc)) from exc

        self.stdout.write(self.style.SUCCESS(f"Done. created={created}, updated={updated}, dry_run={dry_run}"))
