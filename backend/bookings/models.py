from django.db import models
from django.conf import settings
from properties.models import Property
import uuid


class Availability(models.Model):
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name="availability")
    date = models.DateField()
    is_available = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = "Availabilities"
        constraints = [
            models.UniqueConstraint(fields=["property", "date"], name="unique_property_date"),
        ]
        indexes = [
            models.Index(fields=["property", "date"]),
        ]
        ordering = ["date"]

    def __str__(self):
        return f"{self.property_id} - {self.date}"


class Booking(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        CONFIRMED = "confirmed", "Confirmed"
        PAID = "paid", "Paid"
        CANCELLED = "cancelled", "Cancelled"
        COMPLETED = "completed", "Completed"
        REFUND_REQUESTED = "refund_requested", "Refund Requested"
        REFUNDED = "refunded", "Refunded"
        DISPUTED = "disputed", "Disputed"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="bookings")
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name="bookings")
    check_in = models.DateField()
    check_out = models.DateField()
    total_price = models.DecimalField(max_digits=12, decimal_places=2)
    booking_reference = models.CharField(max_length=30, unique=True, blank=True, default="")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    payment_reference = models.CharField(max_length=100, blank=True, null=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    cancellation_reason = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["user", "status"]),
            models.Index(fields=["property", "status"]),
        ]

    def __str__(self):
        return f"Booking {self.id} - {self.property} ({self.check_in} to {self.check_out})"

    def save(self, *args, **kwargs):
        if not self.booking_reference:
            self.booking_reference = f"KM{uuid.uuid4().hex[:10].upper()}"
        super().save(*args, **kwargs)
