from django.contrib import admin
from .models import ServiceProvider, ServiceRequest

@admin.register(ServiceProvider)
class ServiceProviderAdmin(admin.ModelAdmin):
    list_display = ('business_name', 'provider_type', 'user', 'status', 'is_verified')
    list_filter = ('provider_type', 'status', 'is_verified')
    search_fields = ('business_name', 'user__email')

@admin.register(ServiceRequest)
class ServiceRequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer', 'provider', 'service_type', 'status', 'created_at')
    list_filter = ('status', 'service_type')
    search_fields = ('customer__email', 'provider__business_name')
