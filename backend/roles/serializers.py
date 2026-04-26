from rest_framework import serializers
from .models import Role, Permission, RolePermission, UserRole, PartnerProfile, VerificationDocument
from users.models import User


class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ("id", "code", "name", "description", "category")


class RoleSerializer(serializers.ModelSerializer):
    permission_count = serializers.SerializerMethodField()
    permissions = PermissionSerializer(source="role_permissions.permission", many=True, read_only=True)

    class Meta:
        model = Role
        fields = (
            "id",
            "name",
            "display_name",
            "description",
            "is_admin_role",
            "is_partner_role",
            "permission_count",
            "permissions",
            "created_at",
        )

    def get_permission_count(self, obj):
        return obj.role_permissions.count()


class UserRoleSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source="role.display_name", read_only=True)
    user_email = serializers.CharField(source="user.email", read_only=True)
    assigned_by_name = serializers.CharField(source="assigned_by.username", read_only=True)

    class Meta:
        model = UserRole
        fields = (
            "id",
            "user",
            "user_email",
            "role",
            "role_display",
            "assigned_by",
            "assigned_by_name",
            "assigned_at",
            "is_active",
        )
        read_only_fields = ("assigned_at",)


class PartnerProfileSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source="user.email", read_only=True)
    user_name = serializers.CharField(source="user.username", read_only=True)
    verified_by_name = serializers.CharField(source="verified_by.username", read_only=True)

    class Meta:
        model = PartnerProfile
        fields = (
            "id",
            "user",
            "user_email",
            "user_name",
            "business_name",
            "business_registration_number",
            "tax_id",
            "address",
            "verification_status",
            "verified_at",
            "verified_by",
            "verified_by_name",
            "rejection_reason",
            "commission_rate",
            "total_earnings",
            "pending_payout",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("verified_at", "total_earnings", "pending_payout", "created_at", "updated_at")


class VerificationDocumentSerializer(serializers.ModelSerializer):
    partner_name = serializers.CharField(source="partner.business_name", read_only=True)
    reviewed_by_name = serializers.CharField(source="reviewed_by.username", read_only=True)

    class Meta:
        model = VerificationDocument
        fields = (
            "id",
            "partner",
            "partner_name",
            "document_type",
            "file",
            "document_number",
            "issue_date",
            "expiry_date",
            "status",
            "reviewed_by",
            "reviewed_by_name",
            "reviewed_at",
            "notes",
            "uploaded_at",
        )
        read_only_fields = ("uploaded_at", "reviewed_at")


class UserPermissionsSerializer(serializers.Serializer):
    """
    Serializer to return user's roles and permissions
    """

    user_id = serializers.IntegerField()
    username = serializers.CharField()
    email = serializers.EmailField()
    roles = serializers.ListField(child=serializers.CharField())
    permissions = serializers.ListField(child=serializers.CharField())
    is_admin = serializers.BooleanField()
    is_partner = serializers.BooleanField()
