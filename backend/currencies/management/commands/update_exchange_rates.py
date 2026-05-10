"""
Management command: update_exchange_rates

Fetches live rates from open.er-api.com (free, no key required)
and seeds/updates Currency and ExchangeRate records.

Usage:
    python manage.py update_exchange_rates

Schedule: run every 6 hours via Cloud Scheduler or startup hook.
"""
import urllib.request
import json
from django.core.management.base import BaseCommand
from django.utils import timezone
from currencies.models import Currency, ExchangeRate

# Phase 1 supported currencies
CURRENCIES = [
    {'code': 'USD', 'name': 'US Dollar',           'symbol': '$',   'flag_emoji': '🇺🇸', 'order': 1},
    {'code': 'KES', 'name': 'Kenyan Shilling',      'symbol': 'KSh', 'flag_emoji': '🇰🇪', 'order': 2},
    {'code': 'TZS', 'name': 'Tanzanian Shilling',   'symbol': 'TSh', 'flag_emoji': '🇹🇿', 'order': 3},
    {'code': 'UGX', 'name': 'Ugandan Shilling',     'symbol': 'USh', 'flag_emoji': '🇺🇬', 'order': 4},
    {'code': 'RWF', 'name': 'Rwandan Franc',        'symbol': 'RF',  'flag_emoji': '🇷🇼', 'order': 5},
    {'code': 'ETB', 'name': 'Ethiopian Birr',       'symbol': 'Br',  'flag_emoji': '🇪🇹', 'order': 6},
    {'code': 'EUR', 'name': 'Euro',                 'symbol': '€',   'flag_emoji': '🇪🇺', 'order': 7},
    {'code': 'GBP', 'name': 'British Pound',        'symbol': '£',   'flag_emoji': '🇬🇧', 'order': 8},
]

# Free exchange rate API — no key needed
# Returns: { "rates": { "KES": 129.5, "TZS": 2590, ... }, ... }
RATE_API_URL = 'https://open.er-api.com/v6/latest/USD'


class Command(BaseCommand):
    help = 'Fetch latest exchange rates and seed Currency/ExchangeRate tables'

    def handle(self, *args, **options):
        # 1. Seed / update Currency records
        self.stdout.write('Seeding currencies...')
        for c in CURRENCIES:
            Currency.objects.update_or_create(
                code=c['code'],
                defaults={
                    'name': c['name'],
                    'symbol': c['symbol'],
                    'flag_emoji': c['flag_emoji'],
                    'order': c['order'],
                    'is_active': True,
                },
            )
        self.stdout.write(self.style.SUCCESS(f'  {len(CURRENCIES)} currencies seeded.'))

        # 2. Fetch rates
        self.stdout.write(f'Fetching rates from {RATE_API_URL} ...')
        try:
            with urllib.request.urlopen(RATE_API_URL, timeout=15) as resp:
                data = json.loads(resp.read().decode())
        except Exception as e:
            self.stderr.write(self.style.ERROR(f'Failed to fetch rates: {e}'))
            return

        if data.get('result') != 'success':
            self.stderr.write(self.style.ERROR(f'API returned error: {data}'))
            return

        rates = data.get('rates', {})
        now = timezone.now()
        codes = [c['code'] for c in CURRENCIES]
        updated = 0

        for code in codes:
            if code == 'USD':
                rate_value = 1.0
            elif code in rates:
                rate_value = rates[code]
            else:
                self.stdout.write(f'  ⚠ Rate not found for {code}, skipping.')
                continue

            ExchangeRate.objects.update_or_create(
                target_currency=code,
                defaults={'rate': rate_value, 'updated_at': now},
            )
            updated += 1

        self.stdout.write(self.style.SUCCESS(
            f'  ✓ {updated} exchange rates updated at {now:%Y-%m-%d %H:%M} UTC'
        ))
