from rest_framework import serializers
from .models import Currency, ExchangeRate


class CurrencySerializer(serializers.ModelSerializer):
    class Meta:
        model = Currency
        fields = ('code', 'name', 'symbol', 'flag_emoji')


class ExchangeRateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExchangeRate
        fields = ('target_currency', 'rate', 'updated_at')
