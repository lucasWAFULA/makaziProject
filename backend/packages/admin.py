from django.contrib import admin

from .models import TravelPackage


@admin.register(TravelPackage)
class TravelPackageAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "package_type",
        "duration_label",
        "price_from",
        "transport_included",
        "meals_included",
        "is_active",
    )
    list_filter = ("package_type", "transport_included", "meals_included", "is_active")
    search_fields = ("name", "slug", "description", "includes")
