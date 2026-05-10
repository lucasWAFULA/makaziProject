from rest_framework import viewsets, mixins, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum
from .models import Commission, Payment
from .serializers import CommissionSerializer, PaymentSerializer


class BillingSummaryView(APIView):
    """
    Returns the agent's current billing summary:
    - total pending balance
    - next due date
    - billing status (from User profile)
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if not user.is_host:
            return Response({"error": "Only agents have billing accounts"}, status=403)
            
        pending_commissions = Commission.objects.filter(agent=user, status=Commission.Status.PENDING)
        # Assuming most base amounts are in KES for aggregation, but in a real multi-currency 
        # setup we'd group by currency or convert. For Phase 1, we sum by currency.
        balances = list(pending_commissions.values('currency').annotate(total=Sum('commission_amount')))
        
        next_due = pending_commissions.order_by('due_date').first()
        
        # Summary of payments
        total_paid = Payment.objects.filter(
            agent=user, status=Payment.Status.VERIFIED
        ).values('currency').annotate(total=Sum('amount'))

        return Response({
            "billing_status": getattr(user, 'billing_status', 'active'),
            "balances": balances,
            "total_paid": list(total_paid),
            "next_due_date": next_due.due_date if next_due else None,
        })


class CommissionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Agents can only view their commissions, they cannot edit them directly.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CommissionSerializer

    def get_queryset(self):
        return Commission.objects.filter(agent=self.request.user)


class PaymentViewSet(mixins.CreateModelMixin, mixins.ListModelMixin, viewsets.GenericViewSet):
    """
    Agents can view their payment history and upload new payment proofs.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PaymentSerializer

    def get_queryset(self):
        return Payment.objects.filter(agent=self.request.user)
