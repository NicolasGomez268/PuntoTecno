"""
Serializadores para el sistema de órdenes
"""
from rest_framework import serializers
from .models import Customer, RepairOrder, OrderStatusHistory

class CustomerSerializer(serializers.ModelSerializer):
    """Serializador para clientes"""
    
    full_name = serializers.SerializerMethodField()
    orders_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Customer
        fields = [
            'id', 'dni', 'customer_number', 'first_name', 'last_name',
            'full_name', 'phone', 'email', 'address', 'orders_count', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_full_name(self, obj):
        return obj.get_full_name()
    
    def get_orders_count(self, obj):
        return obj.orders.count()


class OrderStatusHistorySerializer(serializers.ModelSerializer):
    """Serializador para historial de estados"""
    
    changed_by_name = serializers.SerializerMethodField()
    previous_status_display = serializers.CharField(
        source='order.get_status_display',
        read_only=True
    )
    
    class Meta:
        model = OrderStatusHistory
        fields = [
            'id', 'order', 'previous_status', 'new_status',
            'previous_status_display', 'notes', 'changed_by',
            'changed_by_name', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_changed_by_name(self, obj):
        return obj.changed_by.get_full_name() if obj.changed_by else 'Sistema'


class RepairOrderSerializer(serializers.ModelSerializer):
    """Serializador para órdenes de reparación"""
    
    customer_name = serializers.CharField(source='customer.get_full_name', read_only=True)
    customer_phone = serializers.CharField(source='customer.phone', read_only=True)
    customer_email = serializers.CharField(source='customer.email', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    device_type_display = serializers.CharField(source='get_device_type_display', read_only=True)
    assigned_to_name = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()
    remaining_balance = serializers.SerializerMethodField()
    
    class Meta:
        model = RepairOrder
        fields = [
            'id', 'order_number', 'customer', 'customer_name', 'customer_phone', 'customer_email',
            'device_type', 'device_type_display', 'device_brand', 'device_model',
            'device_color', 'device_serial', 'security_data', 'problem_description',
            'diagnosis', 'repair_notes', 'general_observations',
            'status', 'status_display', 'estimated_cost', 'final_cost',
            'deposit_amount', 'remaining_balance', 'payment_method',
            'assigned_to', 'assigned_to_name', 'created_by', 'created_by_name',
            'received_date', 'estimated_delivery', 'delivered_date', 'updated_at'
        ]
        read_only_fields = [
            'id', 'order_number', 'received_date', 'updated_at', 'created_by'
        ]
    
    def get_assigned_to_name(self, obj):
        return obj.assigned_to.get_full_name() if obj.assigned_to else None
    
    def get_created_by_name(self, obj):
        return obj.created_by.get_full_name() if obj.created_by else None
    
    def get_remaining_balance(self, obj):
        return float(obj.remaining_balance())
    
    def create(self, validated_data):
        """Crea una nueva orden"""
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        """Actualiza una orden y registra cambios de estado"""
        old_status = instance.status
        new_status = validated_data.get('status', old_status)
        
        # Si cambió el estado, registrar en el historial
        if old_status != new_status:
            OrderStatusHistory.objects.create(
                order=instance,
                previous_status=old_status,
                new_status=new_status,
                changed_by=self.context['request'].user,
                notes=f"Estado cambiado de {instance.get_status_display()} a {dict(RepairOrder.STATUS_CHOICES)[new_status]}"
            )
        
        return super().update(instance, validated_data)


class RepairOrderDetailSerializer(RepairOrderSerializer):
    """Serializador detallado con historial de estados"""
    
    status_history = OrderStatusHistorySerializer(many=True, read_only=True)
    customer_detail = CustomerSerializer(source='customer', read_only=True)
    
    class Meta(RepairOrderSerializer.Meta):
        fields = RepairOrderSerializer.Meta.fields + ['status_history', 'customer_detail']
