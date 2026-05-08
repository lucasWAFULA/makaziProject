from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from notifications.mailer import send_test_email


class Command(BaseCommand):
    help = "Send a test email through the configured SMTP backend (use to verify Zoho creds)."

    def add_arguments(self, parser):
        parser.add_argument(
            "to",
            help="Email address to send the test message to (e.g. you@yourdomain.com).",
        )

    def handle(self, *args, **options):
        target = (options["to"] or "").strip()
        if "@" not in target:
            raise CommandError("Provide a valid email address.")

        backend = getattr(settings, "EMAIL_BACKEND", "")
        host = getattr(settings, "EMAIL_HOST", "")
        port = getattr(settings, "EMAIL_PORT", "")
        user = getattr(settings, "EMAIL_HOST_USER", "")
        from_addr = getattr(settings, "DEFAULT_FROM_EMAIL", "")

        self.stdout.write(self.style.NOTICE(
            f"Backend: {backend}\nHost: {host}:{port}\nUser: {user or '(unset)'}\nFrom: {from_addr}"
        ))

        ok = send_test_email(target)
        if ok:
            self.stdout.write(self.style.SUCCESS(f"Test email sent to {target}."))
        else:
            raise CommandError(
                "Email send returned False. Check the application logs for the SMTP error."
            )
