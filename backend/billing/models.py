"""
Platform Revenue Collection System (Agent Billing).

MakaziPlus tracks referrals and earns commissions.
Agents pay the platform via M-Pesa or Bank transfer.
"""
from django.conf import settings
from django.db import models
from django.utils import timezone
from datetime import timedelta


def default_due_date():
    return timezone.now() + timedelta(days=30)


class Commission(models.Model):
    """
    A commission fee owed by an agent to MakaziPlus for a successful referral/booking.
    """
    class Status(models.TextChoices):
        PENDING = "pending", "Pending Payment"
        PAID = "paid", "Paid"
        OVERDUE = "overdue", "Overdue"
        DISPUTED = "disputed", "Disputed"
        WAIVED = "waived", "Waived"

    agent = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="commissions"
    )
    property = models.ForeignKey(
        "properties.Property", on_delete=models.SET_NULL, null=True, blank=True, related_name="commissions"
    )
    booking_value = models.DecimalField(max_digits=12, decimal_places=2, help_text="Total value of the booking")
    commission_rate = models.DecimalField(max_digits=5, decimal_places=2, help_text="Percentage rate, e.g., 10.00")
    commission_amount = models.DecimalField(max_digits=12, decimal_places=2, help_text="Amount owed to MakaziPlus")
    currency = models.CharField(max_length=5, default="KES")
    
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    due_date = models.DateTimeField(default=default_due_date)
    
    notes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Commission: {self.currency} {self.commission_amount} (Agent: {self.agent.email}) - {self.get_status_display()}"


class Payment(models.Model):
    """
    A payment made by an agent to clear their pending commissions.
    """
    class Method(models.TextChoices):
        MPESA = "mpesa", "M-Pesa Till"
        BANK = "bank", "Bank Transfer"
        CASH = "cash", "Cash"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending Verification"
        VERIFIED = "verified", "Verified"
        REJECTED = "rejected", "Rejected"

    agent = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="payments"
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=5, default="KES")
    method = models.CharField(max_length=20, choices=Method.choices, default=Method.MPESA)
    reference_number = models.CharField(max_length=100, help_text="M-Pesa transaction code or Bank Ref")
    proof_image = models.ImageField(upload_to="billing/receipts/", null=True, blank=True)
    
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    
    admin_notes = models.TextField(blank=True, default="Notes from admin upon verification")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Payment: {self.currency} {self.amount} by {self.agent.email} ({self.get_status_display()})"
