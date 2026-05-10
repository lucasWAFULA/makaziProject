"""
Currency and exchange rate models for MakaziPlus.

Design:
  - Currency  : supported display currencies
  - ExchangeRate : rate relative to USD pivot (updated every 6h)

All rates are stored as: 1 USD = X <target>
To convert: amount_in_base → USD → target
"""
from django.db import models
from django.utils import timezone


class Currency(models.Model):
    code = models.CharField(max_length=5, unique=True)          # KES, TZS, USD
    name = models.CharField(max_length=60)                       # Kenyan Shilling
    symbol = models.CharField(max_length=10)                     # KSh
    flag_emoji = models.CharField(max_length=8, blank=True, default='')  # 🇰🇪
    is_active = models.BooleanField(default=True)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ['order', 'code']
        verbose_name_plural = 'Currencies'

    def __str__(self):
        return f'{self.flag_emoji} {self.code} — {self.name}'


class ExchangeRate(models.Model):
    """
    Rate: 1 USD = <rate> <target_currency>
    All stored relative to USD pivot for easy multi-currency conversion.
    """
    target_currency = models.CharField(max_length=5, db_index=True)
    rate = models.DecimalField(max_digits=18, decimal_places=6)
    updated_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = [['target_currency']]
        ordering = ['target_currency']

    def __str__(self):
        return f'1 USD = {self.rate} {self.target_currency} (updated {self.updated_at:%Y-%m-%d %H:%M})'
