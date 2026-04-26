# KaribuMakazi Role-Based Access Control (RBAC) System

## Overview

This document describes the comprehensive role-based access control system implemented in KaribuMakazi. The system provides granular permission management across different user types and responsibilities.

## Role Hierarchy

```
Super Admin
  ↓
Admin Managers (Operations, Verification, Finance, Support, Content, Marketing, Security)
  ↓
Partners/Providers (House Agent, House Owner, Hotel Owner, Taxi Provider, Tour Provider)
  ↓
Customers
```

## Available Roles

### 1. Super Admin

**Full platform control** - Has all permissions by default.

**Can manage:**
- All users and admins
- All listings and bookings
- All payments and payouts
- System settings
- AI assistant
- Audit logs

### 2. Operations Admin

**Daily platform operations** - Handles listing approvals and bookings.

**Permissions:**
- Approve/reject listings
- Feature listings
- View all listings
- View and manage bookings
- View users
- View analytics

### 3. Verification Admin

**Partner verification and onboarding** - Reviews and approves partner applications.

**Permissions:**
- Verify agents, house owners, hotel owners, taxi providers
- Reject verification requests
- View users

### 4. Finance Admin

**Payment and payout management** - Handles all financial operations.

**Permissions:**
- View all payments
- Manage payments
- Approve refunds
- Manage payouts
- View all bookings
- View analytics

### 5. Support Admin

**Customer support and disputes** - Resolves customer issues.

**Permissions:**
- View support tickets
- Respond to tickets
- Escalate disputes
- View and manage bookings

### 6. Content Admin

**Content and knowledge base management** - Manages travel content.

**Permissions:**
- Manage AI content
- Manage knowledge base
- Manage destinations
- Manage transport routes

### 7. Marketing Admin

**Marketing and promotions** - Handles marketing campaigns.

**Permissions:**
- Manage banners
- Create discount codes
- Feature listings
- View analytics

### 8. House Agent

**Property agents** - Can list properties on behalf of owners.

**Permissions:**
- Manage own listings
- View own bookings
- View own payments

### 9. House Owner

**Property owners** - Can list their own properties.

**Permissions:**
- Manage own listings
- View own bookings
- View own payments

### 10. Hotel/BnB Owner

**Hotel and BnB operators** - Manage hotel rooms and bookings.

**Permissions:**
- Manage own listings
- View own bookings
- View own payments

### 11. Taxi Provider

**Transport service providers** - Manage taxi bookings.

**Permissions:**
- View own bookings
- View own payments

### 12. Tour/Package Provider

**Tour operators** - Manage travel packages.

**Permissions:**
- Manage own listings
- View own bookings
- View own payments

### 13. Customer

**Regular users** - Can book properties and services.

**Permissions:**
- View own bookings
- View own payments

## Status Flows

### Listing Status Flow

```
draft → pending_approval → approved → live
                          ↓
                      rejected
```

Other states: `paused`, `suspended`, `expired`

### Booking Status Flow

```
pending → confirmed → paid → completed
        ↓
    cancelled
        ↓
    refund_requested → refunded
```

Other state: `disputed`

### Partner Verification Flow

```
pending_verification → verified
                     ↓
                 rejected
```

Other state: `suspended`

### Document Verification Flow

```
pending → approved
        ↓
    rejected/expired
```

## API Endpoints

### Role Management

```
GET    /api/rbac/roles/                    # List all roles (admin only)
GET    /api/rbac/roles/{id}/               # Get role details (admin only)

GET    /api/rbac/permissions/              # List all permissions (admin only)

GET    /api/rbac/user-roles/               # List user role assignments (admin only)
POST   /api/rbac/user-roles/               # Assign role to user (admin only)
DELETE /api/rbac/user-roles/{id}/          # Remove role from user (admin only)
```

### Partner Management

```
GET    /api/rbac/partners/                 # List partner profiles
POST   /api/rbac/partners/                 # Create partner profile
GET    /api/rbac/partners/{id}/            # Get partner profile
PUT    /api/rbac/partners/{id}/            # Update partner profile
DELETE /api/rbac/partners/{id}/            # Delete partner profile

POST   /api/rbac/partners/{id}/verify/    # Verify partner (verification admin)
POST   /api/rbac/partners/{id}/reject/    # Reject partner verification
POST   /api/rbac/partners/{id}/suspend/   # Suspend partner
```

### Verification Documents

```
GET    /api/rbac/verification-documents/           # List documents
POST   /api/rbac/verification-documents/           # Upload document
GET    /api/rbac/verification-documents/{id}/      # Get document
PUT    /api/rbac/verification-documents/{id}/      # Update document
DELETE /api/rbac/verification-documents/{id}/      # Delete document

POST   /api/rbac/verification-documents/{id}/approve/  # Approve document
POST   /api/rbac/verification-documents/{id}/reject/   # Reject document
```

### User Permissions

```
GET    /api/rbac/me/permissions/           # Get current user's roles and permissions
POST   /api/rbac/check-permission/         # Check if user has specific permission
```

## Permission Checking

### In Python/Django Views

```python
from roles.permissions import has_permission, require_permission, is_admin_user

# Check permission
if has_permission(request.user, "approve_listings"):
    # Allow action
    pass

# Use decorator
@require_permission("manage_payments")
def process_payment(request):
    pass

# Check admin status
@require_admin
def admin_dashboard(request):
    pass
```

### In DRF Views

```python
from roles.permissions import HasPermission, IsAdminUser, IsPartnerUser

class PropertyApprovalView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def post(self, request, pk):
        if not has_permission(request.user, "approve_listings"):
            return Response({"error": "Insufficient permissions"}, status=403)
        # Approve listing
        pass
```

### Frontend Permission Check

```javascript
// Get user permissions
const response = await axios.get('/api/rbac/me/permissions/');
const { roles, permissions, is_admin, is_partner } = response.data;

// Check specific permission
const canApprove = permissions.includes('approve_listings');

// Check permission via API
const checkResponse = await axios.post('/api/rbac/check-permission/', {
  permission: 'manage_payments'
});
const hasPermission = checkResponse.data.has_permission;
```

## Setup Instructions

### 1. Run Migrations

```bash
docker compose exec backend python manage.py migrate
```

### 2. Seed Roles and Permissions

```bash
docker compose exec backend python manage.py seed_roles_permissions
```

To clear and reseed:

```bash
docker compose exec backend python manage.py seed_roles_permissions --clear
```

### 3. Assign Roles to Users

#### Via Django Admin

1. Go to http://localhost:8888/admin/roles/userrole/
2. Click "Add user role"
3. Select user, role, and save

#### Via API

```bash
curl -X POST http://localhost:8888/api/rbac/user-roles/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user": 1,
    "role": 1,
    "is_active": true
  }'
```

### 4. Create Partner Profile

```bash
curl -X POST http://localhost:8888/api/rbac/partners/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user": 1,
    "business_name": "Coastal Properties Ltd",
    "business_registration_number": "PVT-123456",
    "tax_id": "A001234567Z",
    "address": "Mombasa, Kenya",
    "commission_rate": 15.00
  }'
```

## Database Models

### Role

- `name`: Role identifier (e.g., "super_admin", "house_agent")
- `display_name`: Human-readable name
- `description`: Role description
- `is_admin_role`: Boolean
- `is_partner_role`: Boolean

### Permission

- `code`: Permission identifier (e.g., "approve_listings")
- `name`: Human-readable name
- `description`: Permission description
- `category`: Permission category

### UserRole

- `user`: Foreign key to User
- `role`: Foreign key to Role
- `assigned_by`: Who assigned this role
- `assigned_at`: Timestamp
- `is_active`: Boolean

### PartnerProfile

- `user`: One-to-one with User
- `business_name`: Business/Company name
- `business_registration_number`: Official registration
- `tax_id`: Tax identification
- `verification_status`: pending_verification, verified, rejected, suspended
- `commission_rate`: Percentage (default 15%)
- `total_earnings`: Cumulative earnings
- `pending_payout`: Amount waiting for payout

### VerificationDocument

- `partner`: Foreign key to PartnerProfile
- `document_type`: ID, passport, license, etc.
- `file`: Document upload
- `document_number`: ID/reference number
- `issue_date`: Issue date
- `expiry_date`: Expiry date
- `status`: pending, approved, rejected, expired

## Security Rules

✅ **Implemented security measures:**

1. Super Admin uses Django's built-in superuser system
2. All admin actions are logged in AuditLog
3. Partners cannot approve themselves (verification requires admin)
4. Partners only see their own data (enforced in querysets)
5. Finance actions require specific permissions
6. Listings are soft-deleted (status changed to 'suspended' or 'expired')
7. Suspended users cannot create listings (enforced in views)
8. Payment webhooks require verification (implement in payment views)

## Permission Matrix

| Feature               | Super Admin | Ops Admin | Verification | Finance | Support | Agent/Owner |
| --------------------- | ----------- | --------- | ------------ | ------- | ------- | ----------- |
| Create admins         | ✅           | ❌         | ❌            | ❌       | ❌       | ❌           |
| Approve agents        | ✅           | ❌         | ✅            | ❌       | ❌       | ❌           |
| Approve listings      | ✅           | ✅         | ❌            | ❌       | ❌       | ❌           |
| Manage bookings       | ✅           | ✅         | ❌            | View    | ✅       | Own only    |
| Manage payments       | ✅           | ❌         | ❌            | ✅       | View    | Own only    |
| Manage payouts        | ✅           | ❌         | ❌            | ✅       | ❌       | Own only    |
| Manage AI content     | ✅           | ❌         | ❌            | ❌       | ❌       | ❌           |
| Edit own listings     | ❌           | ❌         | ❌            | ❌       | ❌       | ✅           |
| View audit logs       | ✅           | Limited   | Limited      | Limited | Limited | ❌           |
| Feature listings      | ✅           | ✅         | ❌            | ❌       | ❌       | ❌           |
| Create discounts      | ✅           | ❌         | ❌            | ❌       | ❌       | ❌           |
| View analytics        | ✅           | ✅         | ❌            | ✅       | ❌       | ❌           |

## Best Practices

### For Admins

1. **Principle of Least Privilege**: Only assign necessary permissions
2. **Regular Audits**: Review user roles and permissions quarterly
3. **Verification Process**: Always verify partner documents before approval
4. **Financial Controls**: Require dual approval for large payouts
5. **Audit Logs**: Regularly review audit logs for suspicious activity

### For Partners

1. **Complete Profile**: Fill out all business information
2. **Upload Documents**: Submit all required verification documents
3. **Maintain Status**: Keep documents up to date (check expiry dates)
4. **Follow Guidelines**: Adhere to listing and pricing policies
5. **Respond Promptly**: Reply to booking requests and support tickets

### For Developers

1. **Always Check Permissions**: Use `has_permission()` before sensitive operations
2. **Log Actions**: Create audit log entries for important actions
3. **Validate Input**: Check user input, especially for status changes
4. **Use Transactions**: Wrap financial operations in database transactions
5. **Test Permissions**: Write tests for permission enforcement

## Troubleshooting

### User doesn't have expected permissions

1. Check user's active roles: `/api/rbac/me/permissions/`
2. Verify role has correct permissions in admin
3. Check `is_active` flag on UserRole
4. Verify role's `is_admin_role` or `is_partner_role` flags

### Partner verification not working

1. Check PartnerProfile exists for user
2. Verify documents are uploaded and status is 'approved'
3. Check verification_admin has correct permissions
4. Review audit logs for verification attempts

### Permission denied errors

1. Verify user is authenticated
2. Check user has required role
3. Verify role has required permission
4. Check view permission_classes configuration

## Future Enhancements

- [ ] Two-factor authentication for Super Admin
- [ ] Role templates for quick setup
- [ ] Time-based role assignments
- [ ] IP-based access restrictions
- [ ] Advanced audit log filtering
- [ ] Permission delegation
- [ ] Custom permission groups
- [ ] Automated verification workflows

## Support

For issues or questions about the RBAC system, contact:
- Technical: Check audit logs and permission errors
- Business: Review verification and approval workflows
- Security: Review audit logs for suspicious activity

---

**Last Updated:** April 2026  
**Version:** 1.0.0
