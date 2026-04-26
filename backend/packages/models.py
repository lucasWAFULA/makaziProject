from django.db import models


class TravelPackage(models.Model):
    class PackageType(models.TextChoices):
        AIRPORT_PICKUP_STAY = "airport-pickup-stay", "Airport Pickup + Stay"
        BEACH_HOLIDAY = "beach-holiday-packages", "Beach Holiday Packages"
        FAMILY_VACATION = "family-vacation-packages", "Family Vacation Packages"
        HONEYMOON = "honeymoon-packages", "Honeymoon Packages"
        WEEKEND = "weekend-getaways", "Weekend Getaways"
        EXECUTIVE = "executive-business-stay", "Executive Business Stay"
        STUDENT = "student-budget-packages", "Student Budget Packages"
        ZANZIBAR_FERRY = "zanzibar-ferry-stay", "Zanzibar Ferry + Stay"
        MOMBASA_SGR = "mombasa-sgr-stay", "Mombasa SGR + Stay"

    name = models.CharField(max_length=150)
    slug = models.SlugField(max_length=180, unique=True)
    package_type = models.CharField(max_length=50, choices=PackageType.choices)
    description = models.TextField(blank=True, default="")
    duration_label = models.CharField(max_length=80, blank=True, default="")
    price_from = models.DecimalField(max_digits=12, decimal_places=2)
    includes = models.TextField(blank=True, default="")
    transport_included = models.BooleanField(default=False)
    meals_included = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name
