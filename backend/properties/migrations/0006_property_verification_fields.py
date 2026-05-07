from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("properties", "0005_property_approval_workflow"),
    ]

    operations = [
        migrations.AddField(
            model_name="property",
            name="latitude",
            field=models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True),
        ),
        migrations.AddField(
            model_name="property",
            name="longitude",
            field=models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True),
        ),
        migrations.AddField(
            model_name="property",
            name="landmark",
            field=models.CharField(blank=True, default="", max_length=255),
        ),
        migrations.AddField(
            model_name="property",
            name="contact_name",
            field=models.CharField(blank=True, default="", max_length=120),
        ),
        migrations.AddField(
            model_name="property",
            name="contact_phone",
            field=models.CharField(blank=True, default="", max_length=30),
        ),
        migrations.AddField(
            model_name="property",
            name="ownership_details",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="property",
            name="walkthrough_video_url",
            field=models.URLField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="property",
            name="verification_tier",
            field=models.CharField(
                choices=[
                    ("unverified", "Unverified"),
                    ("remote_verified", "Remote Verified"),
                    ("premium_verified", "Premium Verified"),
                ],
                db_index=True,
                default="unverified",
                max_length=30,
            ),
        ),
        migrations.AddField(
            model_name="property",
            name="verified_by",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="verified_properties",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddField(
            model_name="property",
            name="verified_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="property",
            name="verification_notes",
            field=models.TextField(blank=True, default=""),
        ),
    ]

