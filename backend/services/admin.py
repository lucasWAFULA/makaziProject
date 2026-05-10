from django.contrib import admin
from .models import DeliveryPartner, Restaurant, PropertyDeliveryMap

@admin.register(DeliveryPartner)
class DeliveryPartnerAdmin(admin.ModelAdmin):
    list_display = ('name', 'country', 'category', 'status', 'created_at')
    list_filter = ('country', 'category', 'status')
    search_fields = ('name', 'country')

@admin.register(Restaurant)
class RestaurantAdmin(admin.ModelAdmin):
    list_display = ('name', 'location', 'delivery_available', 'partner', 'is_sponsored', 'rating')
    list_filter = ('delivery_available', 'is_sponsored', 'partner')
    search_fields = ('name', 'location')

@admin.register(PropertyDeliveryMap)
class PropertyDeliveryMapAdmin(admin.ModelAdmin):
    list_display = ('property', 'partner', 'restaurant', 'availability')
    list_filter = ('availability', 'partner')
    search_fields = ('property__title_sw', 'partner__name', 'restaurant__name')
    raw_id_fields = ('property', 'partner', 'restaurant')
