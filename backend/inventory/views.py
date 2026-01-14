"""
Vistas para el sistema de inventario
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import models
from django.db.models import Q, Sum, Count
from .models import Category, Product, StockMovement
from .serializers import (
    CategorySerializer,
    ProductSerializer,
    StockMovementSerializer,
    ProductStockUpdateSerializer
)
from core.permissions import IsAdmin, IsAdminOrReadOnly

class CategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión de categorías
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
    
    def get_queryset(self):
        queryset = Category.objects.all()
        search = self.request.query_params.get('search', None)
        
        if search:
            queryset = queryset.filter(name__icontains=search)
        
        return queryset


class ProductViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión de productos
    """
    queryset = Product.objects.select_related('category').all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
    
    def get_queryset(self):
        queryset = Product.objects.select_related('category').all()
        
        # Filtros
        search = self.request.query_params.get('search', None)
        category = self.request.query_params.get('category', None)
        low_stock = self.request.query_params.get('low_stock', None)
        is_active = self.request.query_params.get('is_active', None)
        
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(sku__icontains=search) |
                Q(description__icontains=search)
            )
        
        if category:
            queryset = queryset.filter(category_id=category)
        
        if low_stock == 'true':
            queryset = [p for p in queryset if p.is_low_stock()]
            return queryset
        
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active == 'true')
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def low_stock_alerts(self, request):
        """
        Retorna productos con stock bajo el mínimo
        GET /api/inventory/products/low_stock_alerts/
        """
        products = Product.objects.filter(
            quantity__lte=models.F('min_stock'),
            is_active=True
        )
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdmin])
    def update_stock(self, request, pk=None):
        """
        Actualiza el stock de un producto
        POST /api/inventory/products/{id}/update_stock/
        Body: {
            "movement_type": "in|out|adjustment",
            "quantity": 10,
            "reason": "Motivo del movimiento"
        }
        """
        product = self.get_object()
        serializer = ProductStockUpdateSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Crear movimiento de stock
        movement_data = {
            'product': product,
            'movement_type': serializer.validated_data['movement_type'],
            'quantity': serializer.validated_data['quantity'],
            'reason': serializer.validated_data['reason'],
            'user': request.user
        }
        
        movement_serializer = StockMovementSerializer(data=movement_data)
        
        if movement_serializer.is_valid():
            movement_serializer.save()
            
            # Retornar el producto actualizado
            product.refresh_from_db()
            product_serializer = ProductSerializer(product)
            return Response(product_serializer.data)
        
        return Response(movement_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """
        Retorna estadísticas del inventario
        GET /api/inventory/products/statistics/
        """
        total_products = Product.objects.filter(is_active=True).count()
        low_stock_count = Product.objects.filter(
            quantity__lte=models.F('min_stock'),
            is_active=True
        ).count()
        
        total_value = Product.objects.filter(is_active=True).aggregate(
            total=Sum(models.F('quantity') * models.F('unit_price'))
        )['total'] or 0
        
        categories_count = Category.objects.count()
        
        return Response({
            'total_products': total_products,
            'low_stock_count': low_stock_count,
            'total_inventory_value': float(total_value),
            'categories_count': categories_count
        })


class StockMovementViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para consultar movimientos de stock (solo lectura)
    """
    queryset = StockMovement.objects.select_related('product', 'user').all()
    serializer_class = StockMovementSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = StockMovement.objects.select_related('product', 'user').all()
        
        # Filtros
        product = self.request.query_params.get('product', None)
        movement_type = self.request.query_params.get('movement_type', None)
        date_from = self.request.query_params.get('date_from', None)
        date_to = self.request.query_params.get('date_to', None)
        
        if product:
            queryset = queryset.filter(product_id=product)
        
        if movement_type:
            queryset = queryset.filter(movement_type=movement_type)
        
        if date_from:
            queryset = queryset.filter(created_at__gte=date_from)
        
        if date_to:
            queryset = queryset.filter(created_at__lte=date_to)
        
        return queryset
