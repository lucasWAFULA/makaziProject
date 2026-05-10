from django.contrib import admin
from .models import Commission, Payment

@admin.register(Commission)
class CommissionAdmin(admin.ModelAdmin):
    list_display = ("id", "agent", "property", "commission_amount", "currency", "status", "due_date", "created_at")
    list_filter = ("status", "currency", "created_at", "due_date")
    search_fields = ("agent__email", "agent__username", "property__title_sw", "notes")
    date_hierarchy = "created_at"

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("id", "agent", "amount", "currency", "method", "reference_number", "status", "created_at")
    list_filter = ("status", "method", "currency", "created_at")
    search_fields = ("agent__email", "agent__username", "reference_number")
    date_hierarchy = "created_at"
