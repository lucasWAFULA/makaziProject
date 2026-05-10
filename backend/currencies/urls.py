from django.urls import path
from .views import CurrencyListView, ExchangeRateView

urlpatterns = [
    path('', CurrencyListView.as_view(), name='currency-list'),
    path('exchange-rates/', ExchangeRateView.as_view(), name='exchange-rates'),
]
