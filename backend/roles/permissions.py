"""
Permission checking utilities for role-based access control
"""

from functools import wraps
from django.core.exceptions import PermissionDenied
from rest_framework import permissions


def has_permission(user, permission_code):
    """
    Check if a user has a specific permission
    """
    if not user or not user.is_authenticated:
        return False
    
    # Superusers always have all permissions
    if user.is_superuser:
        return True
    
    # Check through user roles
    from .models import UserRole, RolePermission, Permission
    
    try:
        permission = Permission.objects.get(code=permission_code)
        user_roles = UserRole.objects.filter(user=user, is_active=True).values_list('role_id', flat=True)
        
        return RolePermission.objects.filter(
            role_id__in=user_roles,
            permission=permission
        ).exists()
    except Permission.DoesNotExist:
        return False


def has_any_permission(user, permission_codes):
    """
    Check if user has any of the given permissions
    """
    return any(has_permission(user, code) for code in permission_codes)


def has_all_permissions(user, permission_codes):
    """
    Check if user has all of the given permissions
    """
    return all(has_permission(user, code) for code in permission_codes)


def is_admin_user(user):
    """
    Check if user has any admin role
    """
    if not user or not user.is_authenticated:
        return False
    
    if user.is_superuser or user.is_staff:
        return True
    
    from .models import UserRole
    
    return UserRole.objects.filter(
        user=user,
        is_active=True,
        role__is_admin_role=True
    ).exists()


def is_partner_user(user):
    """
    Check if user has any partner role
    """
    if not user or not user.is_authenticated:
        return False
    
    from .models import UserRole
    
    return UserRole.objects.filter(
        user=user,
        is_active=True,
        role__is_partner_role=True
    ).exists()


def get_user_permissions(user):
    """
    Get all permission codes for a user
    """
    if not user or not user.is_authenticated:
        return []
    
    if user.is_superuser:
        from .models import Permission
        return list(Permission.objects.values_list('code', flat=True))
    
    from .models import UserRole, RolePermission
    
    user_roles = UserRole.objects.filter(user=user, is_active=True).values_list('role_id', flat=True)
    
    return list(
        RolePermission.objects.filter(
            role_id__in=user_roles
        ).values_list('permission__code', flat=True).distinct()
    )


def get_user_roles(user):
    """
    Get all active role names for a user
    """
    if not user or not user.is_authenticated:
        return []
    
    from .models import UserRole
    
    return list(
        UserRole.objects.filter(
            user=user,
            is_active=True
        ).values_list('role__name', flat=True)
    )


def require_permission(permission_code):
    """
    Decorator to require a specific permission for a view
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapped_view(request, *args, **kwargs):
            if not has_permission(request.user, permission_code):
                raise PermissionDenied(f"You do not have permission: {permission_code}")
            return view_func(request, *args, **kwargs)
        return wrapped_view
    return decorator


def require_any_permission(*permission_codes):
    """
    Decorator to require any of the specified permissions
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapped_view(request, *args, **kwargs):
            if not has_any_permission(request.user, permission_codes):
                raise PermissionDenied(f"You do not have any of: {', '.join(permission_codes)}")
            return view_func(request, *args, **kwargs)
        return wrapped_view
    return decorator


def require_admin(view_func):
    """
    Decorator to require admin role
    """
    @wraps(view_func)
    def wrapped_view(request, *args, **kwargs):
        if not is_admin_user(request.user):
            raise PermissionDenied("Admin access required")
        return view_func(request, *args, **kwargs)
    return wrapped_view


def require_partner(view_func):
    """
    Decorator to require partner role
    """
    @wraps(view_func)
    def wrapped_view(request, *args, **kwargs):
        if not is_partner_user(request.user):
            raise PermissionDenied("Partner access required")
        return view_func(request, *args, **kwargs)
    return wrapped_view


class HasPermission(permissions.BasePermission):
    """
    DRF permission class to check for specific permission
    """
    permission_code = None
    
    def has_permission(self, request, view):
        if not self.permission_code:
            return False
        return has_permission(request.user, self.permission_code)


class IsAdminUser(permissions.BasePermission):
    """
    DRF permission class to check if user is admin
    """
    def has_permission(self, request, view):
        return is_admin_user(request.user)


class IsPartnerUser(permissions.BasePermission):
    """
    DRF permission class to check if user is partner
    """
    def has_permission(self, request, view):
        return is_partner_user(request.user)


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    DRF permission class to allow owners to edit their own objects, or admins
    """
    def has_object_permission(self, request, view, obj):
        if is_admin_user(request.user):
            return True
        
        # Check various owner fields
        if hasattr(obj, 'user') and obj.user == request.user:
            return True
        if hasattr(obj, 'host') and obj.host == request.user:
            return True
        if hasattr(obj, 'owner') and obj.owner == request.user:
            return True
        if hasattr(obj, 'partner') and hasattr(obj.partner, 'user') and obj.partner.user == request.user:
            return True
            
        return False
