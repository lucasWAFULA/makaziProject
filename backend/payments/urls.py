from django.urls import path
from .views import MpesaInitiateView, MpesaCallbackView

urlpatterns = [
    path("mpesa/initiate/", MpesaInitiateView.as_view(), name="mpesa-initiate"),
    path("mpesa/callback/", MpesaCallbackView.as_view(), name="mpesa-callback"),
]
