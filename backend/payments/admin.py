from django.contrib import admin

from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "booking",
        "provider",
        "reference",
        "amount",
        "mode",
        "status",
        "refund_status",
        "created_at",
    )
    list_filter = ("provider", "status", "created_at")
    search_fields = (
        "reference",
        "booking__id",
        "booking__user__email",
        "booking__property__title_sw",
    )
    autocomplete_fields = ("booking",)
    readonly_fields = ("callback_payload", "created_at")
    date_hierarchy = "created_at"
    fieldsets = (
        (None, {"fields": ("booking", "provider", "reference", "amount", "mode", "status")}),
        ("Refund", {"fields": ("refund_status", "refund_amount")}),
        ("Callback", {"fields": ("callback_payload",), "classes": ("collapse",)}),
        ("Meta", {"fields": ("created_at",)}),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("booking", "booking__user", "booking__property")
