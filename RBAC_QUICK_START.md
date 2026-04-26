# RBAC Quick Start Guide

## What is implemented?

KaribuMakazi now has a complete **Role-Based Access Control (RBAC)** system with:

- ✅ **13 Roles** (Super Admin, 6 Admin types, 5 Partner types, Customer)
- ✅ **39 Permissions** (covering all platform operations)
- ✅ **94 Role-Permission mappings** (pre-configured)
- ✅ **Partner verification workflow** (documents, status tracking)
- ✅ **Django Admin integration** (manage roles, users, permissions)
- ✅ **REST API** (role assignment, permission checking)
- ✅ **Python utilities** (decorators, permission functions)
- ✅ **Frontend utilities** (React hooks, permission guards)

## Quick Setup (5 steps)

### 1. Backend is already configured ✓

The roles app is installed, migrated, and seeded.

### 2. Verify setup

```bash
docker compose exec backend python manage.py shell -c "
from roles.models import Role, Permission, RolePermission
print(f'Roles: {Role.objects.count()}')
print(f'Permissions: {Permission.objects.count()}')
print(f'Mappings: {RolePermission.objects.count()}')
"
```

Expected output:
```
Roles: 13
Permissions: 39
Mappings: 94
```

### 3. Assign Super Admin role to your user

```bash
# Replace 1 with your actual user ID
docker compose exec backend python manage.py shell -c "
from roles.models import Role, UserRole
from users.models import User
user = User.objects.get(id=1)
role = Role.objects.get(name='super_admin')
UserRole.objects.create(user=user, role=role, is_active=True)
print(f'Super Admin role assigned to {user.username}')
"
```

### 4. Access Django Admin

Go to: http://localhost:8888/admin/

You'll see new sections:
- **Roles & Permissions** → Roles
- **Roles & Permissions** → Permissions
- **Roles & Permissions** → User Roles
- **Roles & Permissions** → Partner Profiles
- **Roles & Permissions** → Verification Documents

### 5. Test API endpoints

```bash
# Get your user's permissions (requires authentication token)
curl http://localhost:8888/api/rbac/me/permissions/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Check specific permission
curl -X POST http://localhost:8888/api/rbac/check-permission/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"permission": "approve_listings"}'
```

## Available Roles

| Role | Type | Description |
|------|------|-------------|
| **super_admin** | Admin | Full platform control |
| **operations_admin** | Admin | Approve listings, manage bookings |
| **verification_admin** | Admin | Verify partner documents |
| **finance_admin** | Admin | Handle payments, refunds, payouts |
| **support_admin** | Admin | Customer support, disputes |
| **content_admin** | Admin | Manage AI, destinations, routes |
| **marketing_admin** | Admin | Banners, discounts, analytics |
| **house_agent** | Partner | List properties for clients |
| **house_owner** | Partner | List own properties |
| **hotel_owner** | Partner | Manage hotel/BnB rooms |
| **taxi_provider** | Partner | Transport services |
| **tour_provider** | Partner | Travel packages |
| **customer** | User | Book properties and services |

## Key Permission Categories

**User Management:** create_admins, manage_users, view_users, delete_users

**Verification:** verify_agents, verify_owners, verify_hotels, verify_taxi, reject_verification

**Listings:** approve_listings, reject_listings, feature_listings, edit_any_listing, manage_own_listings

**Bookings:** view_all_bookings, manage_bookings, cancel_bookings, view_own_bookings

**Payments:** view_all_payments, manage_payments, approve_refunds, manage_payouts, set_commissions

**Content:** manage_ai_content, manage_knowledge_base, manage_destinations, manage_routes

**Marketing:** manage_banners, create_discounts, view_analytics

**System:** view_audit_logs, manage_settings, access_admin_panel

## API Endpoints Reference

### Roles & Permissions
```
GET    /api/rbac/roles/                          # List all roles
GET    /api/rbac/permissions/                    # List all permissions
GET    /api/rbac/user-roles/                     # List user-role assignments
POST   /api/rbac/user-roles/                     # Assign role to user
DELETE /api/rbac/user-roles/{id}/                # Remove role from user
```

### Partner Management
```
GET    /api/rbac/partners/                       # List partner profiles
POST   /api/rbac/partners/                       # Create partner profile
GET    /api/rbac/partners/{id}/                  # Get partner details
PUT    /api/rbac/partners/{id}/                  # Update partner profile
POST   /api/rbac/partners/{id}/verify/          # Verify partner
POST   /api/rbac/partners/{id}/reject/          # Reject verification
POST   /api/rbac/partners/{id}/suspend/         # Suspend partner
```

### Verification Documents
```
GET    /api/rbac/verification-documents/        # List documents
POST   /api/rbac/verification-documents/        # Upload document
POST   /api/rbac/verification-documents/{id}/approve/  # Approve
POST   /api/rbac/verification-documents/{id}/reject/   # Reject
```

### Permission Checking
```
GET    /api/rbac/me/permissions/                # Get current user's permissions
POST   /api/rbac/check-permission/              # Check specific permission
```

## Using Permissions in Code

### Python/Django

```python
from roles.permissions import has_permission, require_permission, is_admin_user

# Check permission
if has_permission(request.user, 'approve_listings'):
    # Allow action
    pass

# Use decorator
@require_permission('manage_payments')
def process_payment(request):
    pass

# Check admin
if is_admin_user(request.user):
    # Admin-only action
    pass
```

### Django REST Framework

```python
from roles.permissions import IsAdminUser, HasPermission

class PropertyApprovalView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def post(self, request, pk):
        if not has_permission(request.user, 'approve_listings'):
            return Response({"error": "No permission"}, status=403)
        # Approve listing
```

### React/Frontend

```javascript
import { hasPermission, isAdmin, PERMISSIONS } from '@/utils/permissions';

// Check permission
const canApprove = await hasPermission(PERMISSIONS.APPROVE_LISTINGS);

// Use hook
const { permissions, isAdmin, hasPermission } = usePermissions();

// Use component
<PermissionGuard permission="approve_listings">
  <ApproveButton />
</PermissionGuard>

<AdminOnly>
  <AdminDashboard />
</AdminOnly>
```

## Workflow Examples

### 1. Partner Registration & Verification

```
1. User registers → role = "customer"
2. User creates partner profile → verification_status = "pending_verification"
3. User uploads documents (ID, business license, etc.)
4. Verification Admin reviews documents
5. Admin approves → verification_status = "verified"
6. Verification Admin assigns partner role (house_agent, hotel_owner, etc.)
7. Partner can now create listings
8. Operations Admin approves listings
9. Listings go live
```

### 2. Listing Approval Workflow

```
1. Partner creates listing → status = "draft"
2. Partner submits for approval → status = "pending_approval"
3. Operations Admin reviews
4. Admin approves → status = "approved" → "live"
   OR
   Admin rejects → status = "rejected" (with reason)
```

### 3. Payment & Payout Flow

```
1. Customer pays for booking
2. Booking status = "paid"
3. Platform commission deducted (15% default)
4. Partner pending_payout += amount - commission
5. Finance Admin reviews payouts
6. Finance Admin approves payout
7. Partner receives payment
```

## Testing the System

### 1. Create test users with different roles

```bash
docker compose exec backend python manage.py shell
```

```python
from users.models import User
from roles.models import Role, UserRole

# Create users
admin = User.objects.create_user('ops_admin', 'ops@test.com', 'password')
agent = User.objects.create_user('agent1', 'agent@test.com', 'password')

# Assign roles
ops_role = Role.objects.get(name='operations_admin')
agent_role = Role.objects.get(name='house_agent')

UserRole.objects.create(user=admin, role=ops_role, is_active=True)
UserRole.objects.create(user=agent, role=agent_role, is_active=True)
```

### 2. Test permissions

```python
from roles.permissions import has_permission, get_user_permissions

# Check specific permission
has_permission(admin, 'approve_listings')  # True
has_permission(agent, 'approve_listings')  # False

# Get all permissions
perms = get_user_permissions(admin)
print(perms)
```

### 3. Test API

```bash
# Login as operations admin
curl -X POST http://localhost:8888/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "ops_admin", "password": "password"}'

# Get permissions
curl http://localhost:8888/api/rbac/me/permissions/ \
  -H "Authorization: Bearer TOKEN_HERE"

# Should show: is_admin=true, permissions=['approve_listings', ...]
```

## Common Tasks

### Assign role to user

**Via Admin:** Users & Roles → User Roles → Add

**Via API:**
```bash
curl -X POST http://localhost:8888/api/rbac/user-roles/ \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user": 2,
    "role": 8,
    "is_active": true
  }'
```

### Create partner profile

```bash
curl -X POST http://localhost:8888/api/rbac/partners/ \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user": 2,
    "business_name": "Coastal Homes Ltd",
    "commission_rate": 15.00
  }'
```

### Verify partner

```bash
curl -X POST http://localhost:8888/api/rbac/partners/1/verify/ \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

## Troubleshooting

**"Permission denied" errors:**
- Check user has correct role: `/api/rbac/me/permissions/`
- Verify role has required permission in admin
- Check UserRole `is_active=True`

**Partner can't create listings:**
- Verify partner profile exists
- Check verification_status = "verified"
- Ensure partner has correct role (house_agent, hotel_owner, etc.)

**Admin can't approve listings:**
- Check has `approve_listings` permission
- Verify is_admin_role = True on role
- Check access_admin_panel permission

## Next Steps

1. ✅ RBAC system is set up
2. Assign Super Admin role to yourself
3. Create test users with different roles
4. Test permission enforcement
5. Create partner profiles for testing
6. Upload verification documents
7. Test approval workflows
8. Integrate frontend permission guards
9. Add audit logging for sensitive actions
10. Configure commission rates per partner

## Full Documentation

See **[RBAC_SYSTEM.md](./RBAC_SYSTEM.md)** for:
- Complete permission list
- Detailed API documentation
- Security best practices
- Advanced workflows
- Frontend integration guide
- Troubleshooting guide

## Support

- **Django Admin:** http://localhost:8888/admin/roles/
- **API Base:** http://localhost:8888/api/rbac/
- **Documentation:** RBAC_SYSTEM.md
- **Code:** `backend/roles/` directory
