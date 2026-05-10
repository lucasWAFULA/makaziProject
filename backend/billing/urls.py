from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BillingSummaryView, CommissionViewSet, PaymentViewSet

router = DefaultRouter()
router.register(r'commissions', CommissionViewSet, basename='commission')
router.register(r'payments', PaymentViewSet, basename='payment')

urlpatterns = [
    path('summary/', BillingSummaryView.as_view(), name='billing-summary'),
    path('', include(router.urls)),
]
