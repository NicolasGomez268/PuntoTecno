"""
Serializadores para el sistema de ventas
"""
from rest_framework import serializers
from .models import Sale, SaleItem
from inventory.models import Product


class SaleItemSerializer(serializers.ModelSerializer):
    """Serializer para items de venta"""
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    
    class Meta:
        model = SaleItem
        fields = [
            'id', 'product', 'product_name', 'product_sku',
            'quantity', 'unit_price', 'subtotal'
        ]
        read_only_fields = ['subtotal']


class SaleSerializer(serializers.ModelSerializer):
    """Serializer para ventas"""
    items = SaleItemSerializer(many=True)
    customer_display = serializers.CharField(source='get_customer_display', read_only=True)
    employee_name = serializers.CharField(source='employee.get_full_name', read_only=True)
    
    class Meta:
        model = Sale
        fields = [
            'id', 'sale_number', 'date', 'customer', 'customer_name', 
            'customer_display', 'subtotal', 'discount', 'total',
            'payment_method', 'payment_status', 'paid_amount', 'balance',
            'employee', 'employee_name', 'notes',
            'items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['sale_number', 'date', 'subtotal', 'total', 'employee', 'balance', 'payment_status']
    
    def create(self, validated_data):
        """Crea la venta con sus items y actualiza el inventario"""
        items_data = validated_data.pop('items')
        
        # Obtener el usuario del request
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['employee'] = request.user
        
        # Generar número de venta automáticamente
        last_sale = Sale.objects.order_by('-id').first()
        if last_sale and last_sale.sale_number:
            try:
                last_number = int(last_sale.sale_number.split('-')[1])
                new_number = f"VTA-{last_number + 1:06d}"
            except (IndexError, ValueError):
                new_number = "VTA-000001"
        else:
            new_number = "VTA-000001"
        
        validated_data['sale_number'] = new_number
        
        # Crear la venta
        sale = Sale.objects.create(**validated_data)
        
        # Crear los items y actualizar inventario
        for item_data in items_data:
            product = item_data['product']
            quantity = item_data['quantity']
            
            # Verificar stock disponible
            if product.quantity < quantity:
                raise serializers.ValidationError(
                    f"Stock insuficiente para {product.name}. Disponible: {product.quantity}"
                )
            
            # Crear el item
            SaleItem.objects.create(sale=sale, **item_data)
            
            # Descontar del inventario
            product.quantity -= quantity
            product.save()
        
        # Calcular totales
        sale.calculate_totals()
        
        return sale
    
    def validate_items(self, items):
        """Valida que haya al menos un item"""
        if not items:
            raise serializers.ValidationError("La venta debe tener al menos un producto")
        return items


class SaleListSerializer(serializers.ModelSerializer):
    """Serializer simplificado para listado de ventas"""
    customer_display = serializers.CharField(source='get_customer_display', read_only=True)
    employee_name = serializers.CharField(source='employee.get_full_name', read_only=True)
    items_count = serializers.IntegerField(source='items.count', read_only=True)
    
    class Meta:
        model = Sale
        fields = [
            'id', 'sale_number', 'date', 'customer_display',
            'total', 'payment_method', 'employee_name', 'items_count'
        ]
