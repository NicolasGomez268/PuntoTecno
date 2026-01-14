from django.contrib import admin
from .models import Service

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('name', 'device_brand', 'device_model', 'base_price', 'is_active', 'created_at')
    list_filter = ('is_active', 'device_brand')
    search_fields = ('name', 'device_brand', 'device_model', 'description')
    ordering = ('name',)
