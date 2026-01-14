"""
Modelos para el sistema de inventario
"""
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Category(models.Model):
    """
    Modelo de categorías de productos
    """
    name = models.CharField(
        max_length=100,
        unique=True,
        verbose_name='Nombre'
    )
    
    description = models.TextField(
        blank=True,
        verbose_name='Descripción'
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Fecha de creación'
    )
    
    class Meta:
        verbose_name = 'Categoría'
        verbose_name_plural = 'Categorías'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Product(models.Model):
    """
    Modelo de productos en inventario
    """
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name='products',
        verbose_name='Categoría'
    )
    
    name = models.CharField(
        max_length=200,
        verbose_name='Nombre'
    )
    
    description = models.TextField(
        blank=True,
        verbose_name='Descripción'
    )
    
    sku = models.CharField(
        max_length=50,
        unique=True,
        verbose_name='SKU'
    )
    
    quantity = models.IntegerField(
        default=0,
        verbose_name='Cantidad disponible'
    )
    
    min_stock = models.IntegerField(
        default=5,
        verbose_name='Stock mínimo'
    )
    
    unit_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='Precio unitario'
    )
    
    sale_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='Precio de venta'
    )
    
    is_active = models.BooleanField(
        default=True,
        verbose_name='Activo'
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Fecha de creación'
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Última actualización'
    )
    
    class Meta:
        verbose_name = 'Producto'
        verbose_name_plural = 'Productos'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} ({self.sku})"
    
    def is_low_stock(self):
        """Verifica si el producto está por debajo del stock mínimo"""
        return self.quantity <= self.min_stock
    
    def total_value(self):
        """Calcula el valor total del stock"""
        return self.quantity * self.unit_price


class StockMovement(models.Model):
    """
    Modelo para registrar movimientos de stock
    """
    MOVEMENT_TYPES = (
        ('in', 'Entrada'),
        ('out', 'Salida'),
        ('adjustment', 'Ajuste'),
    )
    
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='movements',
        verbose_name='Producto'
    )
    
    movement_type = models.CharField(
        max_length=20,
        choices=MOVEMENT_TYPES,
        verbose_name='Tipo de movimiento'
    )
    
    quantity = models.IntegerField(
        verbose_name='Cantidad'
    )
    
    previous_quantity = models.IntegerField(
        verbose_name='Cantidad anterior'
    )
    
    new_quantity = models.IntegerField(
        verbose_name='Nueva cantidad'
    )
    
    reason = models.TextField(
        verbose_name='Motivo'
    )
    
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='stock_movements',
        verbose_name='Usuario'
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Fecha'
    )
    
    class Meta:
        verbose_name = 'Movimiento de stock'
        verbose_name_plural = 'Movimientos de stock'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_movement_type_display()} - {self.product.name} ({self.quantity})"
