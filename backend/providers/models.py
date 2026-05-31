from django.db import models
from django.conf import settings

class ServiceProvider(models.Model):
    class ProviderType(models.TextChoices):
        FOOD = 'FOOD', 'Food Service'
        DELIVERY = 'DELIVERY', 'Delivery Partner'
        BUSINESS = 'BUSINESS', 'Business Service'

    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending Verification'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'
        SUSPENDED = 'SUSPENDED', 'Suspended'

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='provider_profile'
    )
    provider_type = models.CharField(
        max_length=20,
        choices=ProviderType.choices
    )
    business_name = models.CharField(max_length=255)
    contact_phone = models.CharField(max_length=50)
    location = models.CharField(max_length=255, help_text="City, region, or specific area of operation")
    
    # Verification & Metadata
    is_verified = models.BooleanField(default=False)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )
    
    id_document = models.FileField(
        upload_to='providers/documents/id/',
        blank=True, null=True,
        help_text="National ID or Passport"
    )
    business_document = models.FileField(
        upload_to='providers/documents/business/',
        blank=True, null=True,
        help_text="Business registration documents (if applicable)"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.business_name} ({self.get_provider_type_display()})"

class ServiceRequest(models.Model):
    class RequestStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        ACCEPTED = 'ACCEPTED', 'Accepted'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        COMPLETED = 'COMPLETED', 'Completed'
        CANCELLED = 'CANCELLED', 'Cancelled'
        REJECTED = 'REJECTED', 'Rejected'

    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='service_requests'
    )
    provider = models.ForeignKey(
        ServiceProvider,
        on_delete=models.CASCADE,
        related_name='incoming_requests'
    )
    service_type = models.CharField(
        max_length=20,
        choices=ServiceProvider.ProviderType.choices
    )
    details = models.TextField(help_text="Details of the order or request")
    status = models.CharField(
        max_length=20,
        choices=RequestStatus.choices,
        default=RequestStatus.PENDING
    )
    price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        blank=True, 
        null=True, 
        help_text="Agreed price in KES"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Request #{self.id} - {self.customer} to {self.provider.business_name}"
