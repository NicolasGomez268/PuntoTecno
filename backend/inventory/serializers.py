"""
Serializadores para el sistema de inventario
"""
from rest_framework import serializers
from .models import Category, Product, StockMovement

class CategorySerializer(serializers.ModelSerializer):
    """Serializador para categorías"""
    
    products_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'products_count', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_products_count(self, obj):
        return obj.products.count()


class ProductSerializer(serializers.ModelSerializer):
    """Serializador para productos"""
    
    category_name = serializers.CharField(source='category.name', read_only=True)
    is_low_stock = serializers.SerializerMethodField()
    total_value = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'category', 'category_name', 'name', 'description',
            'sku', 'quantity', 'min_stock', 'unit_price', 'sale_price',
            'is_active', 'is_low_stock', 'total_value',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_is_low_stock(self, obj):
        return obj.is_low_stock()
    
    def get_total_value(self, obj):
        return float(obj.total_value())


class StockMovementSerializer(serializers.ModelSerializer):
    """Serializador para movimientos de stock"""
    
    product_name = serializers.CharField(source='product.name', read_only=True)
    user_name = serializers.SerializerMethodField()
    movement_type_display = serializers.CharField(source='get_movement_type_display', read_only=True)
    
    class Meta:
        model = StockMovement
        fields = [
            'id', 'product', 'product_name', 'movement_type',
            'movement_type_display', 'quantity', 'previous_quantity',
            'new_quantity', 'reason', 'user', 'user_name', 'created_at'
        ]
        read_only_fields = ['id', 'previous_quantity', 'new_quantity', 'user', 'created_at']
    
    def get_user_name(self, obj):
        return obj.user.get_full_name() if obj.user else 'Sistema'
    
    def create(self, validated_data):
        """Crea un movimiento de stock y actualiza la cantidad del producto"""
        product = validated_data['product']
        movement_type = validated_data['movement_type']
        quantity = validated_data['quantity']
        
        # Guardar cantidad anterior
        validated_data['previous_quantity'] = product.quantity
        
        # Calcular nueva cantidad según el tipo de movimiento
        if movement_type == 'in':
            product.quantity += quantity
        elif movement_type == 'out':
            if product.quantity < quantity:
                raise serializers.ValidationError(
                    f"No hay suficiente stock. Disponible: {product.quantity}"
                )
            product.quantity -= quantity
        elif movement_type == 'adjustment':
            product.quantity = quantity
        
        validated_data['new_quantity'] = product.quantity
        product.save()
        
        # Crear el movimiento
        movement = StockMovement.objects.create(**validated_data)
        return movement


class ProductStockUpdateSerializer(serializers.Serializer):
    """Serializador para actualizar el stock de un producto"""
    
    movement_type = serializers.ChoiceField(choices=['in', 'out', 'adjustment'])
    quantity = serializers.IntegerField(min_value=0)
    reason = serializers.CharField()
