"""
Management command: update_billing_status

Updates the billing_status of agents based on their oldest overdue commission.
Should be run daily.
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db.models import Min
from datetime import timedelta
from billing.models import Commission
from users.models import User

class Command(BaseCommand):
    help = "Update agent billing statuses based on overdue commissions"

    def handle(self, *args, **options):
        now = timezone.now()
        
        # 1. Mark any pending commission past due date as OVERDUE
        overdue_updated = Commission.objects.filter(
            status=Commission.Status.PENDING,
            due_date__lt=now
        ).update(status=Commission.Status.OVERDUE)
        self.stdout.write(f"Marked {overdue_updated} commissions as overdue.")

        # 2. Find oldest overdue commission for each agent
        agents_with_overdue = Commission.objects.filter(
            status=Commission.Status.OVERDUE
        ).values('agent').annotate(oldest_due=Min('due_date'))
        
        updated_agents = 0
        for entry in agents_with_overdue:
            agent_id = entry['agent']
            oldest_due = entry['oldest_due']
            
            days_overdue = (now - oldest_due).days
            
            # Determine new status based on thresholds
            new_status = User.BillingStatus.ACTIVE
            if days_overdue >= 90:
                new_status = User.BillingStatus.RESTRICTED
            elif days_overdue >= 60:
                new_status = User.BillingStatus.LIMITED
            elif days_overdue >= 30:
                new_status = User.BillingStatus.WARNING
            
            # Update user if status has changed
            # Note: Do not downgrade a manually suspended user
            user = User.objects.get(id=agent_id)
            if user.billing_status not in [new_status, User.BillingStatus.SUSPENDED]:
                user.billing_status = new_status
                user.save(update_fields=['billing_status'])
                updated_agents += 1
                self.stdout.write(f"Updated Agent {user.email} to {new_status} ({days_overdue} days overdue)")
                
        # 3. Restore status to ACTIVE for users who paid up, but were restricted by billing system
        # (Only touch those in warning, limited, restricted. Leave suspended alone).
        agents_with_no_overdue = User.objects.filter(
            billing_status__in=[
                User.BillingStatus.WARNING, 
                User.BillingStatus.LIMITED, 
                User.BillingStatus.RESTRICTED
            ]
        ).exclude(id__in=[e['agent'] for e in agents_with_overdue])
        
        restored = 0
        for user in agents_with_no_overdue:
            user.billing_status = User.BillingStatus.ACTIVE
            user.save(update_fields=['billing_status'])
            restored += 1
            
        self.stdout.write(f"Restored {restored} agents to ACTIVE status.")
        self.stdout.write(self.style.SUCCESS("Billing status update complete."))
