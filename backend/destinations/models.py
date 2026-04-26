from django.db import models
from django.utils.text import slugify


class Destination(models.Model):
    destination_id = models.BigAutoField(primary_key=True)
    country = models.CharField(max_length=100)
    region = models.CharField(max_length=100)
    destination_name = models.CharField(max_length=150)
    destination_slug = models.SlugField(max_length=180, unique=True, blank=True)
    destination_type = models.CharField(max_length=100, blank=True, default="")
    tourism_category = models.CharField(max_length=100, blank=True, default="")
    is_featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["country", "region", "destination_name"]
        constraints = [
            models.UniqueConstraint(
                fields=["country", "region", "destination_name"],
                name="unique_destination_per_region",
            ),
        ]

    def save(self, *args, **kwargs):
        if not self.destination_slug:
            base = slugify(f"{self.country}-{self.region}-{self.destination_name}")
            self.destination_slug = base[:170]
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.destination_name}, {self.region}, {self.country}"
