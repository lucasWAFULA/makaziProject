from django.db import models
from django.conf import settings


class Role(models.Model):
    """
    Platform roles: Super Admin, Admin Staff, Partners, Customers
    """

    class RoleType(models.TextChoices):
        # Top level
        SUPER_ADMIN = "super_admin", "Super Admin"
        
        # Admin staff
        OPERATIONS_ADMIN = "operations_admin", "Operations Admin"
        VERIFICATION_ADMIN = "verification_admin", "Verification Admin"
        FINANCE_ADMIN = "finance_admin", "Finance Admin"
        SUPPORT_ADMIN = "support_admin", "Support Admin"
        CONTENT_ADMIN = "content_admin", "Content Admin"
        MARKETING_ADMIN = "marketing_admin", "Marketing Admin"
        SECURITY_ADMIN = "security_admin", "Security Admin"
        
        # Partners/Providers
        HOUSE_AGENT = "house_agent", "House Agent"
        HOUSE_OWNER = "house_owner", "House Owner"
        HOTEL_OWNER = "hotel_owner", "Hotel/BnB Owner"
        TAXI_PROVIDER = "taxi_provider", "Taxi Provider"
        TOUR_PROVIDER = "tour_provider", "Tour/Package Provider"
        
        # Customers
        CUSTOMER = "customer", "Customer"

    name = models.CharField(max_length=50, choices=RoleType.choices, unique=True)
    display_name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    is_admin_role = models.BooleanField(default=False)
    is_partner_role = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.display_name


class Permission(models.Model):
    """
    Granular permissions for actions
    """

    class PermissionCode(models.TextChoices):
        # User management
        CREATE_ADMINS = "create_admins", "Create Admins"
        MANAGE_USERS = "manage_users", "Manage Users"
        VIEW_USERS = "view_users", "View Users"
        DELETE_USERS = "delete_users", "Delete Users"
        
        # Verification
        VERIFY_AGENTS = "verify_agents", "Verify Agents"
        VERIFY_OWNERS = "verify_owners", "Verify House Owners"
        VERIFY_HOTELS = "verify_hotels", "Verify Hotels/BnBs"
        VERIFY_TAXI = "verify_taxi", "Verify Taxi Providers"
        REJECT_VERIFICATION = "reject_verification", "Reject Verification"
        
        # Listings
        APPROVE_LISTINGS = "approve_listings", "Approve Listings"
        REJECT_LISTINGS = "reject_listings", "Reject Listings"
        EDIT_ANY_LISTING = "edit_any_listing", "Edit Any Listing"
        DELETE_LISTINGS = "delete_listings", "Delete Listings"
        FEATURE_LISTINGS = "feature_listings", "Feature Listings"
        VIEW_ALL_LISTINGS = "view_all_listings", "View All Listings"
        MANAGE_OWN_LISTINGS = "manage_own_listings", "Manage Own Listings"
        
        # Bookings
        VIEW_ALL_BOOKINGS = "view_all_bookings", "View All Bookings"
        MANAGE_BOOKINGS = "manage_bookings", "Manage Bookings"
        CANCEL_BOOKINGS = "cancel_bookings", "Cancel Bookings"
        VIEW_OWN_BOOKINGS = "view_own_bookings", "View Own Bookings"
        
        # Payments
        VIEW_ALL_PAYMENTS = "view_all_payments", "View All Payments"
        MANAGE_PAYMENTS = "manage_payments", "Manage Payments"
        APPROVE_REFUNDS = "approve_refunds", "Approve Refunds"
        MANAGE_PAYOUTS = "manage_payouts", "Manage Payouts"
        SET_COMMISSIONS = "set_commissions", "Set Commissions"
        VIEW_OWN_PAYMENTS = "view_own_payments", "View Own Payments"
        
        # Support
        VIEW_TICKETS = "view_tickets", "View Support Tickets"
        RESPOND_TICKETS = "respond_tickets", "Respond to Tickets"
        ESCALATE_DISPUTES = "escalate_disputes", "Escalate Disputes"
        
        # Content
        MANAGE_AI_CONTENT = "manage_ai_content", "Manage AI Content"
        MANAGE_KNOWLEDGE_BASE = "manage_knowledge_base", "Manage Knowledge Base"
        MANAGE_DESTINATIONS = "manage_destinations", "Manage Destinations"
        MANAGE_ROUTES = "manage_routes", "Manage Transport Routes"
        
        # Marketing
        MANAGE_BANNERS = "manage_banners", "Manage Banners"
        CREATE_DISCOUNTS = "create_discounts", "Create Discount Codes"
        VIEW_ANALYTICS = "view_analytics", "View Analytics"
        
        # System
        VIEW_AUDIT_LOGS = "view_audit_logs", "View Audit Logs"
        MANAGE_SETTINGS = "manage_settings", "Manage System Settings"
        ACCESS_ADMIN_PANEL = "access_admin_panel", "Access Admin Panel"

    code = models.CharField(max_length=60, choices=PermissionCode.choices, unique=True)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=50, default="general")

    class Meta:
        ordering = ["category", "code"]

    def __str__(self):
        return self.name


class RolePermission(models.Model):
    """
    Many-to-many relationship between roles and permissions
    """

    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name="role_permissions")
    permission = models.ForeignKey(Permission, on_delete=models.CASCADE, related_name="permission_roles")
    granted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["role", "permission"]
        ordering = ["role", "permission"]

    def __str__(self):
        return f"{self.role.name} → {self.permission.code}"


class UserRole(models.Model):
    """
    Assign roles to users
    """

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="user_roles")
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name="users")
    assigned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="roles_assigned",
    )
    assigned_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ["user", "role"]
        ordering = ["-assigned_at"]

    def __str__(self):
        return f"{self.user.username} → {self.role.name}"


class PartnerProfile(models.Model):
    """
    Extended profile for partners (agents, owners, providers)
    """

    class VerificationStatus(models.TextChoices):
        PENDING = "pending_verification", "Pending Verification"
        VERIFIED = "verified", "Verified"
        REJECTED = "rejected", "Rejected"
        SUSPENDED = "suspended", "Suspended"

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="partner_profile")
    business_name = models.CharField(max_length=200, blank=True)
    business_registration_number = models.CharField(max_length=100, blank=True)
    tax_id = models.CharField(max_length=100, blank=True)
    address = models.TextField(blank=True)
    verification_status = models.CharField(
        max_length=30, choices=VerificationStatus.choices, default=VerificationStatus.PENDING
    )
    verified_at = models.DateTimeField(null=True, blank=True)
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="verified_partners",
    )
    rejection_reason = models.TextField(blank=True)
    commission_rate = models.DecimalField(max_digits=5, decimal_places=2, default=15.00)
    total_earnings = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    pending_payout = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.business_name or 'Partner'}"


class VerificationDocument(models.Model):
    """
    Documents uploaded for partner verification
    """

    class DocumentType(models.TextChoices):
        NATIONAL_ID = "national_id", "National ID"
        PASSPORT = "passport", "Passport"
        BUSINESS_LICENSE = "business_license", "Business License"
        TAX_CERTIFICATE = "tax_certificate", "Tax Certificate"
        PROPERTY_DEED = "property_deed", "Property Deed/Title"
        LEASE_AGREEMENT = "lease_agreement", "Lease Agreement"
        DRIVER_LICENSE = "driver_license", "Driver License"
        VEHICLE_REGISTRATION = "vehicle_registration", "Vehicle Registration"
        INSURANCE = "insurance", "Insurance Certificate"
        OTHER = "other", "Other Document"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending Review"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"
        EXPIRED = "expired", "Expired"

    partner = models.ForeignKey(PartnerProfile, on_delete=models.CASCADE, related_name="documents")
    document_type = models.CharField(max_length=30, choices=DocumentType.choices)
    file = models.FileField(upload_to="verification_documents/%Y/%m/")
    document_number = models.CharField(max_length=100, blank=True)
    issue_date = models.DateField(null=True, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="reviewed_documents"
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-uploaded_at"]

    def __str__(self):
        return f"{self.partner.user.username} - {self.document_type}"
