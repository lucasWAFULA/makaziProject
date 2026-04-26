from django.contrib import admin
from django.utils.html import format_html
from .models import Role, Permission, RolePermission, UserRole, PartnerProfile, VerificationDocument


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ("name", "display_name", "is_admin_role", "is_partner_role", "permission_count", "user_count")
    list_filter = ("is_admin_role", "is_partner_role")
    search_fields = ("name", "display_name", "description")
    readonly_fields = ("created_at",)
    
    def permission_count(self, obj):
        return obj.role_permissions.count()
    permission_count.short_description = "Permissions"
    
    def user_count(self, obj):
        return obj.users.filter(is_active=True).count()
    user_count.short_description = "Active Users"


@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "category")
    list_filter = ("category",)
    search_fields = ("code", "name", "description")
    ordering = ("category", "code")


@admin.register(RolePermission)
class RolePermissionAdmin(admin.ModelAdmin):
    list_display = ("role", "permission", "granted_at")
    list_filter = ("role", "permission__category")
    search_fields = ("role__name", "permission__code")
    date_hierarchy = "granted_at"
    autocomplete_fields = ["role", "permission"]


@admin.register(UserRole)
class UserRoleAdmin(admin.ModelAdmin):
    list_display = ("user", "role", "is_active", "assigned_by", "assigned_at")
    list_filter = ("role", "is_active", "assigned_at")
    search_fields = ("user__username", "user__email", "role__name")
    readonly_fields = ("assigned_at",)
    date_hierarchy = "assigned_at"
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related("user", "role", "assigned_by")


@admin.register(PartnerProfile)
class PartnerProfileAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "business_name",
        "verification_badge",
        "commission_rate",
        "pending_payout",
        "created_at",
    )
    list_filter = ("verification_status", "created_at")
    search_fields = ("user__username", "user__email", "business_name", "business_registration_number")
    readonly_fields = ("created_at", "updated_at", "verified_at", "total_earnings")
    date_hierarchy = "created_at"
    
    fieldsets = (
        ("User & Business Info", {
            "fields": ("user", "business_name", "business_registration_number", "tax_id", "address")
        }),
        ("Verification", {
            "fields": ("verification_status", "verified_by", "verified_at", "rejection_reason")
        }),
        ("Financials", {
            "fields": ("commission_rate", "total_earnings", "pending_payout")
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",)
        }),
    )
    
    def verification_badge(self, obj):
        colors = {
            "verified": "#28a745",
            "pending_verification": "#ffc107",
            "rejected": "#dc3545",
            "suspended": "#6c757d",
        }
        color = colors.get(obj.verification_status, "#6c757d")
        return format_html(
            '<span style="color: {}; font-weight: bold;">●</span> {}',
            color,
            obj.get_verification_status_display()
        )
    verification_badge.short_description = "Status"
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related("user", "verified_by")


@admin.register(VerificationDocument)
class VerificationDocumentAdmin(admin.ModelAdmin):
    list_display = (
        "partner",
        "document_type",
        "status",
        "document_number",
        "expiry_date",
        "uploaded_at",
    )
    list_filter = ("status", "document_type", "uploaded_at")
    search_fields = (
        "partner__user__username",
        "partner__business_name",
        "document_number",
    )
    readonly_fields = ("uploaded_at", "reviewed_at")
    date_hierarchy = "uploaded_at"
    
    fieldsets = (
        ("Document Info", {
            "fields": ("partner", "document_type", "file", "document_number")
        }),
        ("Validity", {
            "fields": ("issue_date", "expiry_date")
        }),
        ("Review", {
            "fields": ("status", "reviewed_by", "reviewed_at", "notes")
        }),
        ("Meta", {
            "fields": ("uploaded_at",),
            "classes": ("collapse",)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related("partner__user", "reviewed_by")
