from django.core.management.base import BaseCommand
from django.db import transaction
from roles.models import Role, Permission, RolePermission


class Command(BaseCommand):
    help = "Seed roles and permissions for RBAC system"

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Clear existing roles and permissions before seeding",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        if options["clear"]:
            RolePermission.objects.all().delete()
            Role.objects.all().delete()
            Permission.objects.all().delete()
            self.stdout.write(self.style.WARNING("Cleared existing roles and permissions"))

        # Create all permissions first
        permissions_data = [
            # User management
            {"code": "create_admins", "name": "Create Admins", "category": "user_management"},
            {"code": "manage_users", "name": "Manage Users", "category": "user_management"},
            {"code": "view_users", "name": "View Users", "category": "user_management"},
            {"code": "delete_users", "name": "Delete Users", "category": "user_management"},
            
            # Verification
            {"code": "verify_agents", "name": "Verify Agents", "category": "verification"},
            {"code": "verify_owners", "name": "Verify House Owners", "category": "verification"},
            {"code": "verify_hotels", "name": "Verify Hotels/BnBs", "category": "verification"},
            {"code": "verify_taxi", "name": "Verify Taxi Providers", "category": "verification"},
            {"code": "reject_verification", "name": "Reject Verification", "category": "verification"},
            
            # Listings
            {"code": "approve_listings", "name": "Approve Listings", "category": "listings"},
            {"code": "reject_listings", "name": "Reject Listings", "category": "listings"},
            {"code": "edit_any_listing", "name": "Edit Any Listing", "category": "listings"},
            {"code": "delete_listings", "name": "Delete Listings", "category": "listings"},
            {"code": "feature_listings", "name": "Feature Listings", "category": "listings"},
            {"code": "view_all_listings", "name": "View All Listings", "category": "listings"},
            {"code": "manage_own_listings", "name": "Manage Own Listings", "category": "listings"},
            
            # Bookings
            {"code": "view_all_bookings", "name": "View All Bookings", "category": "bookings"},
            {"code": "manage_bookings", "name": "Manage Bookings", "category": "bookings"},
            {"code": "cancel_bookings", "name": "Cancel Bookings", "category": "bookings"},
            {"code": "view_own_bookings", "name": "View Own Bookings", "category": "bookings"},
            
            # Payments
            {"code": "view_all_payments", "name": "View All Payments", "category": "payments"},
            {"code": "manage_payments", "name": "Manage Payments", "category": "payments"},
            {"code": "approve_refunds", "name": "Approve Refunds", "category": "payments"},
            {"code": "manage_payouts", "name": "Manage Payouts", "category": "payments"},
            {"code": "set_commissions", "name": "Set Commissions", "category": "payments"},
            {"code": "view_own_payments", "name": "View Own Payments", "category": "payments"},
            
            # Support
            {"code": "view_tickets", "name": "View Support Tickets", "category": "support"},
            {"code": "respond_tickets", "name": "Respond to Tickets", "category": "support"},
            {"code": "escalate_disputes", "name": "Escalate Disputes", "category": "support"},
            
            # Content
            {"code": "manage_ai_content", "name": "Manage AI Content", "category": "content"},
            {"code": "manage_knowledge_base", "name": "Manage Knowledge Base", "category": "content"},
            {"code": "manage_destinations", "name": "Manage Destinations", "category": "content"},
            {"code": "manage_routes", "name": "Manage Transport Routes", "category": "content"},
            
            # Marketing
            {"code": "manage_banners", "name": "Manage Banners", "category": "marketing"},
            {"code": "create_discounts", "name": "Create Discount Codes", "category": "marketing"},
            {"code": "view_analytics", "name": "View Analytics", "category": "marketing"},
            
            # System
            {"code": "view_audit_logs", "name": "View Audit Logs", "category": "system"},
            {"code": "manage_settings", "name": "Manage System Settings", "category": "system"},
            {"code": "access_admin_panel", "name": "Access Admin Panel", "category": "system"},
        ]
        
        permissions = {}
        for perm_data in permissions_data:
            perm, created = Permission.objects.get_or_create(
                code=perm_data["code"],
                defaults={"name": perm_data["name"], "category": perm_data["category"]}
            )
            permissions[perm_data["code"]] = perm
        
        self.stdout.write(self.style.SUCCESS(f"Created/verified {len(permissions)} permissions"))

        # Create roles
        roles_data = [
            {
                "name": "super_admin",
                "display_name": "Super Admin",
                "description": "Full platform control",
                "is_admin_role": True,
                "permissions": list(permissions.keys()),  # All permissions
            },
            {
                "name": "operations_admin",
                "display_name": "Operations Admin",
                "description": "Daily platform operations",
                "is_admin_role": True,
                "permissions": [
                    "approve_listings", "reject_listings", "feature_listings", "view_all_listings",
                    "view_all_bookings", "manage_bookings", "view_users", "access_admin_panel",
                    "view_analytics",
                ],
            },
            {
                "name": "verification_admin",
                "display_name": "Verification Admin",
                "description": "Partner verification and onboarding",
                "is_admin_role": True,
                "permissions": [
                    "verify_agents", "verify_owners", "verify_hotels", "verify_taxi", "reject_verification",
                    "view_users", "access_admin_panel",
                ],
            },
            {
                "name": "finance_admin",
                "display_name": "Finance Admin",
                "description": "Payment and payout management",
                "is_admin_role": True,
                "permissions": [
                    "view_all_payments", "manage_payments", "approve_refunds", "manage_payouts",
                    "view_all_bookings", "access_admin_panel", "view_analytics",
                ],
            },
            {
                "name": "support_admin",
                "display_name": "Support Admin",
                "description": "Customer support and disputes",
                "is_admin_role": True,
                "permissions": [
                    "view_tickets", "respond_tickets", "escalate_disputes", "view_all_bookings",
                    "manage_bookings", "access_admin_panel",
                ],
            },
            {
                "name": "content_admin",
                "display_name": "Content Admin",
                "description": "Content and knowledge base management",
                "is_admin_role": True,
                "permissions": [
                    "manage_ai_content", "manage_knowledge_base", "manage_destinations", "manage_routes",
                    "access_admin_panel",
                ],
            },
            {
                "name": "marketing_admin",
                "display_name": "Marketing Admin",
                "description": "Marketing and promotions",
                "is_admin_role": True,
                "permissions": [
                    "manage_banners", "create_discounts", "feature_listings", "view_analytics",
                    "access_admin_panel",
                ],
            },
            {
                "name": "house_agent",
                "display_name": "House Agent",
                "description": "Property agents",
                "is_partner_role": True,
                "permissions": [
                    "manage_own_listings", "view_own_bookings", "view_own_payments",
                ],
            },
            {
                "name": "house_owner",
                "display_name": "House Owner",
                "description": "Property owners",
                "is_partner_role": True,
                "permissions": [
                    "manage_own_listings", "view_own_bookings", "view_own_payments",
                ],
            },
            {
                "name": "hotel_owner",
                "display_name": "Hotel/BnB Owner",
                "description": "Hotel and BnB operators",
                "is_partner_role": True,
                "permissions": [
                    "manage_own_listings", "view_own_bookings", "view_own_payments",
                ],
            },
            {
                "name": "taxi_provider",
                "display_name": "Taxi Provider",
                "description": "Taxi and transport service providers",
                "is_partner_role": True,
                "permissions": [
                    "view_own_bookings", "view_own_payments",
                ],
            },
            {
                "name": "tour_provider",
                "display_name": "Tour/Package Provider",
                "description": "Tour and package operators",
                "is_partner_role": True,
                "permissions": [
                    "manage_own_listings", "view_own_bookings", "view_own_payments",
                ],
            },
            {
                "name": "customer",
                "display_name": "Customer",
                "description": "Regular platform users",
                "is_partner_role": False,
                "is_admin_role": False,
                "permissions": [
                    "view_own_bookings", "view_own_payments",
                ],
            },
        ]
        
        created_count = 0
        for role_data in roles_data:
            role, created = Role.objects.get_or_create(
                name=role_data["name"],
                defaults={
                    "display_name": role_data["display_name"],
                    "description": role_data["description"],
                    "is_admin_role": role_data.get("is_admin_role", False),
                    "is_partner_role": role_data.get("is_partner_role", False),
                }
            )
            
            if created:
                created_count += 1
            
            # Assign permissions to role
            for perm_code in role_data["permissions"]:
                if perm_code in permissions:
                    RolePermission.objects.get_or_create(
                        role=role,
                        permission=permissions[perm_code]
                    )
        
        self.stdout.write(
            self.style.SUCCESS(
                f"Created {created_count} new roles (total {len(roles_data)} roles configured)"
            )
        )
        
        # Summary
        total_role_perms = RolePermission.objects.count()
        self.stdout.write(
            self.style.SUCCESS(
                f"✓ Setup complete: {len(permissions)} permissions, {len(roles_data)} roles, "
                f"{total_role_perms} role-permission mappings"
            )
        )
