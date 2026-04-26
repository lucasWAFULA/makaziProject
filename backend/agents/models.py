from django.conf import settings
from django.db import models


class AgentProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="agent_profile")
    agency_name = models.CharField(max_length=120)
    areas_served = models.TextField(blank=True, default="")
    languages = models.CharField(max_length=120, blank=True, default="English,Kiswahili")
    verified_badge = models.BooleanField(default=False)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    commission_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-verified_badge", "-rating", "-created_at"]

    def __str__(self):
        return self.agency_name or self.user.username
