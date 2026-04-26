from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("bookings", "0003_booking_booking_reference_alter_booking_status"),
    ]

    operations = [
        migrations.AlterField(
            model_name="booking",
            name="status",
            field=models.CharField(
                choices=[
                    ("pending", "Pending"),
                    ("confirmed", "Confirmed"),
                    ("paid", "Paid"),
                    ("cancelled", "Cancelled"),
                    ("completed", "Completed"),
                    ("refund_requested", "Refund Requested"),
                    ("refunded", "Refunded"),
                    ("disputed", "Disputed"),
                ],
                default="pending",
                max_length=20,
            ),
        ),
    ]
