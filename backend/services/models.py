from django.db import models

class DeliveryPartner(models.Model):
    class Category(models.TextChoices):
        RESTAURANT = "restaurant", "Restaurant Delivery"
        GROCERY = "grocery", "Grocery Delivery"
        PHARMACY = "pharmacy", "Pharmacy & Essentials"
        ALL_IN_ONE = "all_in_one", "All-in-One Delivery"

    name = models.CharField(max_length=255)
    country = models.CharField(max_length=100) # e.g. Kenya, Tanzania
    category = models.CharField(max_length=50, choices=Category.choices)
    logo_url = models.URLField(blank=True, null=True)
    referral_link = models.URLField(blank=True, null=True, help_text="Link to open the partner app/website")
    status = models.BooleanField(default=True, help_text="Is this partner currently active?")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.country})"


class Restaurant(models.Model):
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255, help_text="City or specific neighborhood")
    delivery_available = models.BooleanField(default=True)
    partner = models.ForeignKey(DeliveryPartner, on_delete=models.SET_NULL, null=True, blank=True, related_name='restaurants')
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=0.0)
    is_sponsored = models.BooleanField(default=False, help_text="Featured placement for monetization")
    whatsapp_number = models.CharField(max_length=20, blank=True, null=True, help_text="For direct local ordering")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.location}"


class PropertyDeliveryMap(models.Model):
    property = models.ForeignKey('properties.Property', on_delete=models.CASCADE, related_name='delivery_options')
    partner = models.ForeignKey(DeliveryPartner, on_delete=models.CASCADE, null=True, blank=True)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, null=True, blank=True)
    availability = models.BooleanField(default=True)
    
    class Meta:
        unique_together = (('property', 'partner'), ('property', 'restaurant'))

    def __str__(self):
        target = self.partner.name if self.partner else self.restaurant.name
        return f"{self.property.title_sw} -> {target}"
