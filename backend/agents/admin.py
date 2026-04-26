from django.contrib import admin

from .models import AgentProfile


@admin.register(AgentProfile)
class AgentProfileAdmin(admin.ModelAdmin):
    list_display = ("id", "agency_name", "user", "verified_badge", "rating", "commission_rate", "is_active")
    list_filter = ("verified_badge", "is_active")
    search_fields = ("agency_name", "areas_served", "languages", "user__username", "user__email")
