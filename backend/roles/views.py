from rest_framework import viewsets, generics, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import Role, Permission, UserRole, PartnerProfile, VerificationDocument
from .serializers import (
    RoleSerializer,
    PermissionSerializer,
    UserRoleSerializer,
    PartnerProfileSerializer,
    VerificationDocumentSerializer,
    UserPermissionsSerializer,
)
from .permissions import (
    IsAdminUser,
    has_permission,
    get_user_permissions,
    get_user_roles,
    is_admin_user,
    is_partner_user,
)


class RoleViewSet(viewsets.ReadOnlyModelViewSet):
    """
    List all available roles
    """

    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]


class PermissionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    List all available permissions
    """

    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]


class UserRoleViewSet(viewsets.ModelViewSet):
    """
    Manage user role assignments
    """

    queryset = UserRole.objects.select_related("user", "role", "assigned_by")
    serializer_class = UserRoleSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    def perform_create(self, serializer):
        # Auto-assign the current user as the assigner
        serializer.save(assigned_by=self.request.user)


class PartnerProfileViewSet(viewsets.ModelViewSet):
    """
    Manage partner profiles
    """

    queryset = PartnerProfile.objects.select_related("user", "verified_by")
    serializer_class = PartnerProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # Admins can see all profiles
        if is_admin_user(user):
            return self.queryset.all()

        # Partners can only see their own profile
        return self.queryset.filter(user=user)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated, IsAdminUser])
    def verify(self, request, pk=None):
        """
        Verify a partner (verification admin only)
        """
        if not has_permission(request.user, "verify_agents"):
            return Response(
                {"error": "You do not have permission to verify partners"}, status=status.HTTP_403_FORBIDDEN
            )

        profile = self.get_object()
        profile.verification_status = PartnerProfile.VerificationStatus.VERIFIED
        profile.verified_by = request.user
        profile.verified_at = timezone.now()
        profile.save()

        return Response({"status": "Partner verified successfully"})

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated, IsAdminUser])
    def reject(self, request, pk=None):
        """
        Reject a partner verification
        """
        if not has_permission(request.user, "reject_verification"):
            return Response(
                {"error": "You do not have permission to reject verification"}, status=status.HTTP_403_FORBIDDEN
            )

        profile = self.get_object()
        profile.verification_status = PartnerProfile.VerificationStatus.REJECTED
        profile.rejection_reason = request.data.get("reason", "")
        profile.save()

        return Response({"status": "Partner verification rejected"})

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated, IsAdminUser])
    def suspend(self, request, pk=None):
        """
        Suspend a partner
        """
        profile = self.get_object()
        profile.verification_status = PartnerProfile.VerificationStatus.SUSPENDED
        profile.save()

        return Response({"status": "Partner suspended"})


class VerificationDocumentViewSet(viewsets.ModelViewSet):
    """
    Manage verification documents
    """

    queryset = VerificationDocument.objects.select_related("partner__user", "reviewed_by")
    serializer_class = VerificationDocumentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # Admins can see all documents
        if is_admin_user(user):
            return self.queryset.all()

        # Partners can only see their own documents
        if is_partner_user(user):
            try:
                partner_profile = user.partner_profile
                return self.queryset.filter(partner=partner_profile)
            except PartnerProfile.DoesNotExist:
                return self.queryset.none()

        return self.queryset.none()

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated, IsAdminUser])
    def approve(self, request, pk=None):
        """
        Approve a document
        """
        doc = self.get_object()
        doc.status = VerificationDocument.Status.APPROVED
        doc.reviewed_by = request.user
        doc.reviewed_at = timezone.now()
        doc.notes = request.data.get("notes", "")
        doc.save()

        return Response({"status": "Document approved"})

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated, IsAdminUser])
    def reject(self, request, pk=None):
        """
        Reject a document
        """
        doc = self.get_object()
        doc.status = VerificationDocument.Status.REJECTED
        doc.reviewed_by = request.user
        doc.reviewed_at = timezone.now()
        doc.notes = request.data.get("notes", "Document does not meet requirements")
        doc.save()

        return Response({"status": "Document rejected"})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def current_user_permissions(request):
    """
    Get current user's roles and permissions
    """
    user = request.user

    data = {
        "user_id": user.id,
        "username": user.username,
        "email": user.email,
        "roles": get_user_roles(user),
        "permissions": get_user_permissions(user),
        "is_admin": is_admin_user(user),
        "is_partner": is_partner_user(user),
    }

    serializer = UserPermissionsSerializer(data)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def check_permission(request):
    """
    Check if current user has a specific permission
    """
    permission_code = request.data.get("permission")

    if not permission_code:
        return Response({"error": "permission field is required"}, status=status.HTTP_400_BAD_REQUEST)

    has_perm = has_permission(request.user, permission_code)

    return Response({"permission": permission_code, "has_permission": has_perm})
