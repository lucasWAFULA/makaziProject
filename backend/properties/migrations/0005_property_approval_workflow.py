from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


PROPERTY_APPROVAL_SQL = """
ALTER TABLE properties_property ADD COLUMN IF NOT EXISTS approved_at timestamp with time zone NULL;
ALTER TABLE properties_property ADD COLUMN IF NOT EXISTS approved_by_id bigint NULL;
ALTER TABLE properties_property ADD COLUMN IF NOT EXISTS rejection_reason text NOT NULL DEFAULT '';
ALTER TABLE properties_property ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;
ALTER TABLE properties_property ALTER COLUMN approval_status TYPE varchar(30);
ALTER TABLE properties_property ALTER COLUMN approval_status SET DEFAULT 'draft';
CREATE INDEX IF NOT EXISTS properties_approved_by_idx ON properties_property (approved_by_id);
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'properties_property_approved_by_fk'
    ) THEN
        ALTER TABLE properties_property
        ADD CONSTRAINT properties_property_approved_by_fk
        FOREIGN KEY (approved_by_id)
        REFERENCES users_user(id)
        DEFERRABLE INITIALLY DEFERRED;
    END IF;
END $$;
"""


class Migration(migrations.Migration):
    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("properties", "0004_property_destination"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunSQL(sql=PROPERTY_APPROVAL_SQL, reverse_sql=migrations.RunSQL.noop),
            ],
            state_operations=[
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
            ],
        ),
    ]
