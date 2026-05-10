"""
Currency API views.

GET /api/currencies/           — list active currencies
GET /api/exchange-rates/       — all rates (1 USD = X target)
GET /api/exchange-rates/?base=KES  — rates expressed relative to KES
"""
from decimal import Decimal, InvalidOperation

from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Currency, ExchangeRate
from .serializers import CurrencySerializer, ExchangeRateSerializer


class CurrencyListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        currencies = Currency.objects.filter(is_active=True).order_by('order', 'code')
        return Response(CurrencySerializer(currencies, many=True).data)


class ExchangeRateView(APIView):
    """
    Returns rates as: 1 <base> = X <target>
    Default base = USD (how they are stored).
    If ?base=KES, we re-pivot: rate_KES_to_target = rate_USD_to_target / rate_USD_to_KES
    """
    permission_classes = [AllowAny]

    def get(self, request):
        base = request.query_params.get('base', 'USD').upper()
        rates_qs = ExchangeRate.objects.all()
        rates = {r.target_currency: Decimal(str(r.rate)) for r in rates_qs}

        # Ensure USD pivot exists
        rates['USD'] = Decimal('1')

        if base == 'USD':
            payload = {code: float(rate) for code, rate in rates.items()}
        else:
            # Re-pivot: 1 base = ? target
            base_in_usd = rates.get(base)
            if not base_in_usd or base_in_usd == 0:
                return Response({'error': f'Unknown or unsupported base currency: {base}'}, status=400)
            payload = {}
            for code, usd_rate in rates.items():
                try:
                    payload[code] = float(usd_rate / base_in_usd)
                except (InvalidOperation, ZeroDivisionError):
                    pass

        # Also include last updated
        latest = ExchangeRate.objects.order_by('-updated_at').first()
        return Response({
            'base': base,
            'rates': payload,
            'updated_at': latest.updated_at.isoformat() if latest else None,
        })
