from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import ServiceProvider, ServiceRequest
from .serializers import ServiceProviderSerializer, ServiceRequestSerializer

class ServiceProviderViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Service Providers.
    Allows users to register as a provider and view/update their profile.
    Admins can view and manage all providers.
    """
    serializer_class = ServiceProviderSerializer

    def get_queryset(self):
        # Admins see all, regular users see only their own profile
        if self.request.user.is_staff:
            return ServiceProvider.objects.all()
        return ServiceProvider.objects.filter(user=self.request.user)

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'create', 'update', 'partial_update', 'my_profile']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]

    def perform_create(self, serializer):
        # Link the logged-in user to the provider profile
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def my_profile(self, request):
        """Retrieve the provider profile for the currently logged-in user."""
        try:
            provider = ServiceProvider.objects.get(user=request.user)
            serializer = self.get_serializer(provider)
            return Response(serializer.data)
        except ServiceProvider.DoesNotExist:
            return Response(
                {"detail": "You do not have a service provider profile yet."},
                status=status.HTTP_404_NOT_FOUND
            )

class ServiceRequestViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Service Requests (Orders/Transactions).
    Customers see requests they made.
    Providers see requests assigned to them.
    """
    serializer_class = ServiceRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return ServiceRequest.objects.all()
        
        # If user is a provider, show incoming requests as well
        try:
            provider = ServiceProvider.objects.get(user=user)
            # Show requests made BY this user OR assigned TO this provider
            return ServiceRequest.objects.filter(models.Q(customer=user) | models.Q(provider=provider))
        except ServiceProvider.DoesNotExist:
            pass
            
        # Standard customer: show only their own requests
        return ServiceRequest.objects.filter(customer=user)

    def perform_create(self, serializer):
        # The customer is automatically the logged-in user
        serializer.save(customer=self.request.user)

    def update(self, request, *args, **kwargs):
        # Ensure only the assigned provider can update the status/price
        # or the customer can cancel it.
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Determine roles
        is_customer = instance.customer == request.user
        is_provider = False
        try:
            is_provider = (instance.provider.user == request.user)
        except Exception:
            pass

        if not (is_customer or is_provider or request.user.is_staff):
            return Response({"detail": "Not authorized to update this request."}, status=status.HTTP_403_FORBIDDEN)
            
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)
