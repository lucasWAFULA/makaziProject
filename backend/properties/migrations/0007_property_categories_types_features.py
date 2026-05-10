from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("properties", "0006_property_verification_fields"),
    ]

    operations = [
        # ── PropertyCategory ──────────────────────────────────────────────────
        migrations.CreateModel(
            name="PropertyCategory",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name", models.CharField(max_length=100)),
                ("slug", models.SlugField(unique=True)),
                (
                    "icon",
                    models.CharField(
                        blank=True,
                        help_text="Emoji or icon class",
                        max_length=100,
                    ),
                ),
                ("description", models.TextField(blank=True)),
                ("order", models.PositiveIntegerField(db_index=True, default=0)),
                ("is_active", models.BooleanField(default=True)),
            ],
            options={
                "verbose_name": "Property Category",
                "verbose_name_plural": "Property Categories",
                "ordering": ["order", "name"],
            },
        ),
        # ── PropertyType ──────────────────────────────────────────────────────
        migrations.CreateModel(
            name="PropertyType",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name", models.CharField(max_length=100)),
                ("slug", models.SlugField()),
                ("order", models.PositiveIntegerField(db_index=True, default=0)),
                ("is_active", models.BooleanField(default=True)),
                (
                    "category",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="types",
                        to="properties.propertycategory",
                    ),
                ),
            ],
            options={
                "verbose_name": "Property Type",
                "verbose_name_plural": "Property Types",
                "ordering": ["order", "name"],
            },
        ),
        migrations.AlterUniqueTogether(
            name="propertytype",
            unique_together={("category", "slug")},
        ),
        # ── PropertyFeature ───────────────────────────────────────────────────
        migrations.CreateModel(
            name="PropertyFeature",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name", models.CharField(max_length=100)),
                ("slug", models.SlugField(unique=True)),
                (
                    "feature_group",
                    models.CharField(
                        choices=[
                            ("location", "Location"),
                            ("property", "Property"),
                            ("experience", "Experience"),
                            ("service", "Service"),
                        ],
                        db_index=True,
                        max_length=20,
                    ),
                ),
                (
                    "icon",
                    models.CharField(
                        blank=True,
                        help_text="Emoji or icon class",
                        max_length=100,
                    ),
                ),
                ("order", models.PositiveIntegerField(default=0)),
                ("is_active", models.BooleanField(default=True)),
            ],
            options={
                "ordering": ["feature_group", "order", "name"],
            },
        ),
        # ── New FK/M2M fields on Property ─────────────────────────────────────
        migrations.AddField(
            model_name="property",
            name="category",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="properties",
                to="properties.propertycategory",
            ),
        ),
        migrations.AddField(
            model_name="property",
            name="property_type",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="properties",
                to="properties.propertytype",
            ),
        ),
        migrations.AddField(
            model_name="property",
            name="features",
            field=models.ManyToManyField(
                blank=True,
                related_name="properties",
                to="properties.propertyfeature",
            ),
        ),
        # ── Configuration fields ──────────────────────────────────────────────
        migrations.AddField(
            model_name="property",
            name="bedrooms",
            field=models.PositiveSmallIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="property",
            name="beds",
            field=models.PositiveSmallIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="property",
            name="bathrooms",
            field=models.PositiveSmallIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="property",
            name="max_guests",
            field=models.PositiveSmallIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="property",
            name="floor_count",
            field=models.PositiveSmallIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="property",
            name="room_size_sqm",
            field=models.DecimalField(
                blank=True, decimal_places=2, max_digits=8, null=True
            ),
        ),
        # ── Classification fields ─────────────────────────────────────────────
        migrations.AddField(
            model_name="property",
            name="price_tier",
            field=models.CharField(
                blank=True,
                choices=[
                    ("budget", "Budget"),
                    ("standard", "Standard"),
                    ("premium", "Premium"),
                    ("luxury", "Luxury"),
                    ("ultra_luxury", "Ultra Luxury"),
                ],
                db_index=True,
                default="",
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="property",
            name="stay_style",
            field=models.CharField(
                blank=True,
                choices=[
                    ("solo", "Solo Stay"),
                    ("couple", "Couple Stay"),
                    ("family", "Family Stay"),
                    ("group", "Group Stay"),
                    ("corporate", "Corporate Stay"),
                    ("backpacker", "Backpacker Stay"),
                ],
                db_index=True,
                default="",
                max_length=20,
            ),
        ),
    ]
