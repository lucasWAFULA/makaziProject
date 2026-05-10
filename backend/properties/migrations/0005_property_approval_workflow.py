from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("properties", "0004_property_destination"),
    ]

    operations = [
        migrations.AddField(
            model_name="property",
            name="approved_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="property",
            name="approved_by",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="approved_properties",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddField(
            model_name="property",
            name="rejection_reason",
            field=models.TextField(blank=True, default=""),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="property",
            name="is_featured",
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name="property",
            name="approval_status",
            field=models.CharField(
                choices=[
                    ("draft", "Draft"),
                    ("pending_approval", "Pending Approval"),
                    ("approved", "Approved"),
                    ("live", "Live"),
                    ("paused", "Paused"),
                    ("rejected", "Rejected"),
                    ("suspended", "Suspended"),
                    ("expired", "Expired"),
                ],
                default="draft",
                max_length=30,
            ),
        ),
    ]
