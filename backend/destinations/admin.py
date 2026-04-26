from django.contrib import admin

from .models import Destination


@admin.register(Destination)
class DestinationAdmin(admin.ModelAdmin):
    list_display = (
        "destination_name",
        "region",
        "country",
        "destination_type",
        "tourism_category",
        "is_featured",
        "is_active",
    )
    list_filter = ("country", "region", "tourism_category", "is_featured", "is_active")
    search_fields = ("destination_name", "region", "country", "destination_slug")
