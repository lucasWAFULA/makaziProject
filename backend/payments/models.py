from django.db import models
from bookings.models import Booking


class Payment(models.Model):
    class Provider(models.TextChoices):
        MPESA = "mpesa", "M-Pesa"
        AIRTEL = "airtel_money", "Airtel Money"
        TIGO = "tigo_pesa", "Tigo Pesa"
        CARD = "card", "Card"

    class Mode(models.TextChoices):
        DEPOSIT = "deposit", "Deposit"
        FULL = "full", "Full payment"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        COMPLETED = "completed", "Completed"
        FAILED = "failed", "Failed"

    class RefundStatus(models.TextChoices):
        NONE = "none", "No refund"
        PENDING = "pending", "Pending"
        REFUNDED = "refunded", "Refunded"

    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name="payments")
    provider = models.CharField(max_length=20, choices=Provider.choices)
    reference = models.CharField(max_length=100, db_index=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    mode = models.CharField(max_length=20, choices=Mode.choices, default=Mode.FULL)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    refund_status = models.CharField(max_length=20, choices=RefundStatus.choices, default=RefundStatus.NONE)
    refund_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    callback_payload = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.provider} {self.reference} - {self.status}"
