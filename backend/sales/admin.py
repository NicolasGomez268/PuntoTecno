"""
Configuración del admin para ventas
"""
from django.contrib import admin
from .models import Sale, SaleItem


class SaleItemInline(admin.TabularInline):
    model = SaleItem
    extra = 0
    readonly_fields = ['subtotal']


@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = ('sale_number', 'date', 'get_customer_display', 'total', 'payment_method', 'employee')
    list_filter = ('payment_method', 'date')
    search_fields = ('sale_number', 'customer__first_name', 'customer__last_name', 'customer_name')
    readonly_fields = ('sale_number', 'date', 'subtotal', 'total', 'created_at', 'updated_at')
    inlines = [SaleItemInline]
    
    fieldsets = (
        ('Información de la Venta', {
            'fields': ('sale_number', 'date', 'customer', 'customer_name', 'employee')
        }),
        ('Totales', {
            'fields': ('subtotal', 'discount', 'total', 'payment_method')
        }),
        ('Detalles', {
            'fields': ('notes',)
        }),
        ('Auditoría', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(SaleItem)
class SaleItemAdmin(admin.ModelAdmin):
    list_display = ('sale', 'product', 'quantity', 'unit_price', 'subtotal')
    list_filter = ('sale__date',)
    search_fields = ('sale__sale_number', 'product__name')
    readonly_fields = ('subtotal',)
