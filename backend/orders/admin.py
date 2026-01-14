from django.contrib import admin
from .models import Customer, RepairOrder, OrderStatusHistory

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('last_name', 'first_name', 'phone', 'email', 'created_at')
    search_fields = ('first_name', 'last_name', 'phone', 'email')
    ordering = ('last_name', 'first_name')

@admin.register(RepairOrder)
class RepairOrderAdmin(admin.ModelAdmin):
    list_display = (
        'order_number', 'customer', 'device_type', 'device_brand',
        'status', 'assigned_to', 'received_date'
    )
    list_filter = ('status', 'device_type', 'received_date')
    search_fields = (
        'order_number', 'customer__first_name', 'customer__last_name',
        'device_brand', 'device_model', 'device_serial'
    )
    readonly_fields = ('order_number', 'received_date', 'updated_at')
    
    fieldsets = (
        ('Información de la orden', {
            'fields': ('order_number', 'customer', 'status', 'assigned_to')
        }),
        ('Información del dispositivo', {
            'fields': (
                'device_type', 'device_brand', 'device_model', 'device_serial'
            )
        }),
        ('Detalles de la reparación', {
            'fields': (
                'problem_description', 'diagnosis', 'repair_notes'
            )
        }),
        ('Información financiera', {
            'fields': (
                'estimated_cost', 'final_cost', 'deposit_amount'
            )
        }),
        ('Fechas', {
            'fields': (
                'received_date', 'estimated_delivery', 'delivered_date', 'updated_at'
            )
        }),
    )
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('customer', 'assigned_to', 'created_by')

@admin.register(OrderStatusHistory)
class OrderStatusHistoryAdmin(admin.ModelAdmin):
    list_display = (
        'order', 'previous_status', 'new_status', 'changed_by', 'created_at'
    )
    list_filter = ('previous_status', 'new_status', 'created_at')
    search_fields = ('order__order_number', 'notes')
    readonly_fields = ('created_at',)
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('order', 'changed_by')
