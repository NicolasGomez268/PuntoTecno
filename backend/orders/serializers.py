"""
Serializadores para el sistema de órdenes
"""
from rest_framework import serializers
from django.db import transaction
from django.db.models import F
from .models import Customer, RepairOrder, OrderStatusHistory, OrderPart
from inventory.models import Product

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


class OrderPartSerializer(serializers.ModelSerializer):
    """Serializador para los repuestos de una orden (lectura)"""
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = OrderPart
        fields = ['id', 'product', 'product_name', 'product_sku', 'quantity', 'unit_price', 'subtotal']


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
    labor_profit = serializers.SerializerMethodField()

    # Lectura: repuestos ya guardados en la orden
    order_parts = OrderPartSerializer(many=True, read_only=True)

    # Escritura: lista de repuestos a aplicar. Formato: [{product_id, quantity}]
    # Si este campo no se incluye en el request, los repuestos existentes no se tocan.
    parts = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        required=False,
        allow_null=True,
        default=None,
    )

    class Meta:
        model = RepairOrder
        fields = [
            'id', 'order_number', 'customer', 'customer_name', 'customer_phone', 'customer_email',
            'device_type', 'device_type_display', 'device_brand', 'device_model',
            'device_color', 'device_serial', 'security_data', 'problem_description',
            'diagnosis', 'repair_notes', 'general_observations',
            'status', 'status_display', 'estimated_cost', 'final_cost',
            'deposit_amount', 'parts_cost', 'labor_profit', 'remaining_balance',
            'payment_method', 'payment_status', 'paid_amount', 'balance',
            'assigned_to', 'assigned_to_name', 'created_by', 'created_by_name',
            'received_date', 'estimated_delivery', 'delivered_date', 'updated_at',
            'order_parts', 'parts',
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

    def get_labor_profit(self, obj):
        return float(obj.labor_profit())

    # ------------------------------------------------------------------
    # Helpers para manejo de stock
    # ------------------------------------------------------------------

    @staticmethod
    def _restore_stock(order):
        """Devuelve al inventario el stock de los repuestos actuales de la orden."""
        for part in order.order_parts.select_related('product').all():
            Product.objects.filter(pk=part.product_id).update(
                quantity=F('quantity') + part.quantity
            )

    @staticmethod
    def _apply_parts(order, parts_data):
        """
        Borra los repuestos anteriores de la orden y crea los nuevos,
        descontando stock del inventario y recalculando parts_cost.
        parts_data: lista de dicts con 'product_id' y 'quantity'.
        """
        order.order_parts.all().delete()

        total_cost = 0
        for item in parts_data:
            product_id = int(item.get('product_id') or item.get('product'))
            quantity = int(item.get('quantity', 1))
            if quantity <= 0:
                continue

            try:
                product = Product.objects.select_for_update().get(pk=product_id)
            except Product.DoesNotExist:
                raise serializers.ValidationError(
                    f'Producto con id={product_id} no encontrado.'
                )

            if product.quantity < quantity:
                raise serializers.ValidationError(
                    f'Stock insuficiente para "{product.name}": '
                    f'disponible {product.quantity}, solicitado {quantity}.'
                )

            OrderPart.objects.create(
                order=order,
                product=product,
                quantity=quantity,
                unit_price=product.sale_price,
            )

            product.quantity -= quantity
            product.save(update_fields=['quantity'])

            total_cost += float(product.sale_price) * quantity

        # Actualizar parts_cost sin llamar al save() completo (evita lógica de balance)
        RepairOrder.objects.filter(pk=order.pk).update(parts_cost=total_cost)
        order.parts_cost = total_cost

    # ------------------------------------------------------------------
    # Create / Update
    # ------------------------------------------------------------------

    @transaction.atomic
    def create(self, validated_data):
        """Crea una nueva orden y descuenta stock de los repuestos indicados."""
        parts_data = validated_data.pop('parts', None)
        validated_data['created_by'] = self.context['request'].user
        order = super().create(validated_data)

        if parts_data:
            self._apply_parts(order, parts_data)

        return order

    @transaction.atomic
    def update(self, instance, validated_data):
        """Actualiza una orden; si vienen partes nuevas, ajusta el stock."""
        parts_data = validated_data.pop('parts', None)

        old_status = instance.status
        new_status = validated_data.get('status', old_status)

        if old_status != new_status:
            OrderStatusHistory.objects.create(
                order=instance,
                previous_status=old_status,
                new_status=new_status,
                changed_by=self.context['request'].user,
                notes=f"Estado cambiado de {instance.get_status_display()} a {dict(RepairOrder.STATUS_CHOICES)[new_status]}"
            )

        order = super().update(instance, validated_data)

        if parts_data is not None:
            # Primero restaurar el stock de los repuestos anteriores
            self._restore_stock(order)
            # Luego aplicar los nuevos (descuenta stock y guarda OrderPart)
            self._apply_parts(order, parts_data)

        return order


class RepairOrderDetailSerializer(RepairOrderSerializer):
    """Serializador detallado con historial de estados"""
    
    status_history = OrderStatusHistorySerializer(many=True, read_only=True)
    customer_detail = CustomerSerializer(source='customer', read_only=True)
    
    class Meta(RepairOrderSerializer.Meta):
        fields = RepairOrderSerializer.Meta.fields + ['status_history', 'customer_detail']
