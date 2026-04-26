from django.contrib import admin

from .models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("id", "booking", "property_title", "rating", "comment_preview", "created_at")
    list_filter = ("rating", "created_at")
    search_fields = ("comment_sw", "booking__property__title_sw", "booking__user__email")
    autocomplete_fields = ("booking",)
    readonly_fields = ("created_at",)
    date_hierarchy = "created_at"

    @admin.display(description="Property")
    def property_title(self, obj):
        return obj.booking.property.title_sw

    @admin.display(description="Comment")
    def comment_preview(self, obj):
        text = (obj.comment_sw or "").strip()
        if len(text) <= 80:
            return text or "—"
        return text[:80] + "…"

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("booking", "booking__property", "booking__user")
