from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"roles", views.RoleViewSet, basename="role")
router.register(r"permissions", views.PermissionViewSet, basename="permission")
router.register(r"user-roles", views.UserRoleViewSet, basename="user-role")
router.register(r"partners", views.PartnerProfileViewSet, basename="partner")
router.register(r"verification-documents", views.VerificationDocumentViewSet, basename="verification-document")

urlpatterns = [
    path("", include(router.urls)),
    path("me/permissions/", views.current_user_permissions, name="current-user-permissions"),
    path("check-permission/", views.check_permission, name="check-permission"),
]
