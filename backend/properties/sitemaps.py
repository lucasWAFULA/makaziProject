from django.contrib.sitemaps import Sitemap
from .models import Property
from destinations.models import Destination

class PropertySitemap(Sitemap):
    changefreq = "daily"
    priority = 0.9

    def items(self):
        return Property.objects.filter(is_active=True, approval_status="live")

    def lastmod(self, obj):
        return obj.updated_at

class DestinationSitemap(Sitemap):
    changefreq = "weekly"
    priority = 0.8

    def items(self):
        return Destination.objects.filter(is_active=True)

class StaticViewSitemap(Sitemap):
    priority = 1.0
    changefreq = 'daily'

    def items(self):
        return [
            '/',
            '/stays',
            '/agents',
            '/packages',
            '/taxi',
            '/terms',
            '/privacy',
            '/host-responsibility',
            '/fraud-reporting',
            '/dispute-policy',
            '/contact',
        ]

    def location(self, item):
        return item
