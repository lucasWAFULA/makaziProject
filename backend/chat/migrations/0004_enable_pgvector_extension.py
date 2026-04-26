from django.db import migrations


def enable_pgvector(apps, schema_editor):
    if schema_editor.connection.vendor == "postgresql":
        with schema_editor.connection.cursor() as cursor:
            cursor.execute("SELECT 1 FROM pg_available_extensions WHERE name = 'vector'")
            available = cursor.fetchone() is not None
        if available:
            schema_editor.execute("CREATE EXTENSION IF NOT EXISTS vector;")


class Migration(migrations.Migration):
    dependencies = [
        ("chat", "0003_seed_ai_intents"),
    ]

    operations = [migrations.RunPython(enable_pgvector, migrations.RunPython.noop)]
