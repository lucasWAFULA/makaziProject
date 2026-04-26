/**
 * Permission checking utilities for frontend
 */

import axios from 'axios';

/**
 * Cache for user permissions
 */
let permissionsCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch current user's roles and permissions
 */
export async function fetchUserPermissions() {
  try {
    const response = await axios.get('/api/rbac/me/permissions/');
    permissionsCache = response.data;
    cacheTimestamp = Date.now();
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user permissions:', error);
    return null;
  }
}

/**
 * Get cached permissions or fetch if expired
 */
export async function getUserPermissions(forceRefresh = false) {
  if (!forceRefresh && permissionsCache && cacheTimestamp) {
    const cacheAge = Date.now() - cacheTimestamp;
    if (cacheAge < CACHE_DURATION) {
      return permissionsCache;
    }
  }
  return await fetchUserPermissions();
}

/**
 * Check if current user has a specific permission
 */
export async function hasPermission(permissionCode) {
  const permissions = await getUserPermissions();
  if (!permissions) return false;
  return permissions.permissions.includes(permissionCode);
}

/**
 * Check if current user has any of the specified permissions
 */
export async function hasAnyPermission(...permissionCodes) {
  const permissions = await getUserPermissions();
  if (!permissions) return false;
  return permissionCodes.some(code => permissions.permissions.includes(code));
}

/**
 * Check if current user has all of the specified permissions
 */
export async function hasAllPermissions(...permissionCodes) {
  const permissions = await getUserPermissions();
  if (!permissions) return false;
  return permissionCodes.every(code => permissions.permissions.includes(code));
}

/**
 * Check if current user is an admin
 */
export async function isAdmin() {
  const permissions = await getUserPermissions();
  return permissions?.is_admin || false;
}

/**
 * Check if current user is a partner
 */
export async function isPartner() {
  const permissions = await getUserPermissions();
  return permissions?.is_partner || false;
}

/**
 * Check if current user has a specific role
 */
export async function hasRole(roleName) {
  const permissions = await getUserPermissions();
  if (!permissions) return false;
  return permissions.roles.includes(roleName);
}

/**
 * Get all user roles
 */
export async function getUserRoles() {
  const permissions = await getUserPermissions();
  return permissions?.roles || [];
}

/**
 * Clear permissions cache (useful on logout or role change)
 */
export function clearPermissionsCache() {
  permissionsCache = null;
  cacheTimestamp = null;
}

/**
 * React hook for permission checking
 */
export function usePermissions() {
  const [permissions, setPermissions] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    getUserPermissions().then(data => {
      setPermissions(data);
      setLoading(false);
    });
  }, []);

  return {
    permissions,
    loading,
    hasPermission: (code) => permissions?.permissions.includes(code) || false,
    hasAnyPermission: (...codes) => codes.some(code => permissions?.permissions.includes(code)),
    hasAllPermissions: (...codes) => codes.every(code => permissions?.permissions.includes(code)),
    isAdmin: permissions?.is_admin || false,
    isPartner: permissions?.is_partner || false,
    hasRole: (role) => permissions?.roles.includes(role) || false,
    roles: permissions?.roles || [],
    refresh: () => getUserPermissions(true).then(setPermissions),
  };
}

/**
 * React component to conditionally render based on permission
 */
export function PermissionGuard({ permission, any, all, fallback = null, children }) {
  const [hasAccess, setHasAccess] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function checkAccess() {
      let result = false;

      if (permission) {
        result = await hasPermission(permission);
      } else if (any && any.length > 0) {
        result = await hasAnyPermission(...any);
      } else if (all && all.length > 0) {
        result = await hasAllPermissions(...all);
      }

      setHasAccess(result);
      setLoading(false);
    }

    checkAccess();
  }, [permission, any, all]);

  if (loading) {
    return null;
  }

  return hasAccess ? children : fallback;
}

/**
 * React component to conditionally render based on role
 */
export function RoleGuard({ role, any, fallback = null, children }) {
  const [hasAccess, setHasAccess] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function checkAccess() {
      const roles = await getUserRoles();
      
      if (role) {
        setHasAccess(roles.includes(role));
      } else if (any && any.length > 0) {
        setHasAccess(any.some(r => roles.includes(r)));
      }

      setLoading(false);
    }

    checkAccess();
  }, [role, any]);

  if (loading) {
    return null;
  }

  return hasAccess ? children : fallback;
}

/**
 * React component for admin-only content
 */
export function AdminOnly({ fallback = null, children }) {
  const [isAdminUser, setIsAdminUser] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    isAdmin().then(result => {
      setIsAdminUser(result);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return null;
  }

  return isAdminUser ? children : fallback;
}

/**
 * React component for partner-only content
 */
export function PartnerOnly({ fallback = null, children }) {
  const [isPartnerUser, setIsPartnerUser] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    isPartner().then(result => {
      setIsPartnerUser(result);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return null;
  }

  return isPartnerUser ? children : fallback;
}

// Permission codes constants for easy reference
export const PERMISSIONS = {
  // User management
  CREATE_ADMINS: 'create_admins',
  MANAGE_USERS: 'manage_users',
  VIEW_USERS: 'view_users',
  DELETE_USERS: 'delete_users',
  
  // Verification
  VERIFY_AGENTS: 'verify_agents',
  VERIFY_OWNERS: 'verify_owners',
  VERIFY_HOTELS: 'verify_hotels',
  VERIFY_TAXI: 'verify_taxi',
  REJECT_VERIFICATION: 'reject_verification',
  
  // Listings
  APPROVE_LISTINGS: 'approve_listings',
  REJECT_LISTINGS: 'reject_listings',
  EDIT_ANY_LISTING: 'edit_any_listing',
  DELETE_LISTINGS: 'delete_listings',
  FEATURE_LISTINGS: 'feature_listings',
  VIEW_ALL_LISTINGS: 'view_all_listings',
  MANAGE_OWN_LISTINGS: 'manage_own_listings',
  
  // Bookings
  VIEW_ALL_BOOKINGS: 'view_all_bookings',
  MANAGE_BOOKINGS: 'manage_bookings',
  CANCEL_BOOKINGS: 'cancel_bookings',
  VIEW_OWN_BOOKINGS: 'view_own_bookings',
  
  // Payments
  VIEW_ALL_PAYMENTS: 'view_all_payments',
  MANAGE_PAYMENTS: 'manage_payments',
  APPROVE_REFUNDS: 'approve_refunds',
  MANAGE_PAYOUTS: 'manage_payouts',
  SET_COMMISSIONS: 'set_commissions',
  VIEW_OWN_PAYMENTS: 'view_own_payments',
  
  // Support
  VIEW_TICKETS: 'view_tickets',
  RESPOND_TICKETS: 'respond_tickets',
  ESCALATE_DISPUTES: 'escalate_disputes',
  
  // Content
  MANAGE_AI_CONTENT: 'manage_ai_content',
  MANAGE_KNOWLEDGE_BASE: 'manage_knowledge_base',
  MANAGE_DESTINATIONS: 'manage_destinations',
  MANAGE_ROUTES: 'manage_routes',
  
  // Marketing
  MANAGE_BANNERS: 'manage_banners',
  CREATE_DISCOUNTS: 'create_discounts',
  VIEW_ANALYTICS: 'view_analytics',
  
  // System
  VIEW_AUDIT_LOGS: 'view_audit_logs',
  MANAGE_SETTINGS: 'manage_settings',
  ACCESS_ADMIN_PANEL: 'access_admin_panel',
};

// Role names constants
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  OPERATIONS_ADMIN: 'operations_admin',
  VERIFICATION_ADMIN: 'verification_admin',
  FINANCE_ADMIN: 'finance_admin',
  SUPPORT_ADMIN: 'support_admin',
  CONTENT_ADMIN: 'content_admin',
  MARKETING_ADMIN: 'marketing_admin',
  HOUSE_AGENT: 'house_agent',
  HOUSE_OWNER: 'house_owner',
  HOTEL_OWNER: 'hotel_owner',
  TAXI_PROVIDER: 'taxi_provider',
  TOUR_PROVIDER: 'tour_provider',
  CUSTOMER: 'customer',
};
