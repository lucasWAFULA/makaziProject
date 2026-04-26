from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from .models import User, AuditLog


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("username", "email", "role", "is_verified", "is_staff", "date_joined")
    list_filter = ("role", "is_verified", "is_staff", "is_active")
    search_fields = ("username", "email", "phone_number")
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ("Custom Fields", {
            "fields": ("role", "phone_number", "is_verified")
        }),
    )
    
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ("Custom Fields", {
            "fields": ("role", "phone_number", "is_verified")
        }),
    )


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("action", "actor", "entity_type", "entity_id", "created_at")
    list_filter = ("action", "entity_type", "created_at")
    search_fields = ("action", "entity_type", "entity_id", "actor__username")
    readonly_fields = ("actor", "action", "entity_type", "entity_id", "metadata", "created_at")
    date_hierarchy = "created_at"
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False
    
    def has_delete_permission(self, request, obj=None):
        # Only superusers can delete audit logs
        return request.user.is_superuser
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related("actor")
