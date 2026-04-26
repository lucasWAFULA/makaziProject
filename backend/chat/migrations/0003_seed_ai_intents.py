from django.db import migrations


def seed_ai_intents(apps, schema_editor):
    AIIntent = apps.get_model("chat", "AIIntent")
    intents = [
        ("property_search", "Find verified properties based on natural language filters."),
        ("hotel_search", "Find hotel listings by location, budget, and preferences."),
        ("taxi_booking", "Guide taxi transfer requests and pickup flows."),
        ("agent_request", "Match verified agents by area and profile relevance."),
        ("package_request", "Recommend travel and bundled stay packages."),
        ("travel_guide", "Answer destination and transfer guidance from approved content."),
        ("payment_help", "Support payment and refund policy questions."),
        ("general_support", "General support triage and help."),
    ]
    for name, description in intents:
        AIIntent.objects.update_or_create(
            name=name,
            defaults={"description": description, "is_active": True},
        )


def remove_ai_intents(apps, schema_editor):
    AIIntent = apps.get_model("chat", "AIIntent")
    AIIntent.objects.filter(
        name__in=[
            "property_search",
            "hotel_search",
            "taxi_booking",
            "agent_request",
            "package_request",
            "travel_guide",
            "payment_help",
            "general_support",
        ]
    ).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("chat", "0002_ai_concierge_models"),
    ]

    operations = [
        migrations.RunPython(seed_ai_intents, remove_ai_intents),
    ]
