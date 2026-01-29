"""
Modelos para el sistema de ventas
"""
from django.db import models
from django.contrib.auth import get_user_model
from inventory.models import Product
from orders.models import Customer

User = get_user_model()


class Sale(models.Model):
    """
    Modelo de ventas (tickets de venta)
    """
    PAYMENT_METHOD_CHOICES = (
        ('cash', 'Efectivo'),
        ('card', 'Tarjeta'),
        ('transfer', 'Transferencia'),
        ('multiple', 'Múltiple'),
        ('account', 'Cuenta Corriente'),
    )
    
    PAYMENT_STATUS_CHOICES = (
        ('paid', 'Pagado'),
        ('partial', 'Pago Parcial'),
        ('pending', 'Pendiente'),
    )

    sale_number = models.CharField(
        max_length=20,
        unique=True,
        verbose_name='Número de Ticket'
    )
    
    date = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Fecha y Hora'
    )
    
    customer = models.ForeignKey(
        Customer,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sales',
        verbose_name='Cliente'
    )
    
    customer_name = models.CharField(
        max_length=200,
        blank=True,
        verbose_name='Nombre del Cliente',
        help_text='Para ventas sin cliente registrado'
    )
    
    subtotal = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        verbose_name='Subtotal'
    )
    
    discount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        verbose_name='Descuento'
    )
    
    total = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        verbose_name='Total'
    )
    
    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES,
        default='cash',
        verbose_name='Método de Pago'
    )
    
    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default='paid',
        verbose_name='Estado de Pago'
    )
    
    paid_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        verbose_name='Monto Pagado'
    )
    
    balance = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        verbose_name='Saldo Pendiente'
    )
    
    employee = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='sales',
        verbose_name='Vendedor'
    )
    
    notes = models.TextField(
        blank=True,
        verbose_name='Notas'
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Creado el'
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Actualizado el'
    )
    
    class Meta:
        verbose_name = 'Venta'
        verbose_name_plural = 'Ventas'
        ordering = ['-date']
    
    def __str__(self):
        return f"Venta {self.sale_number}"
    
    def get_customer_display(self):
        """Retorna el nombre del cliente (registrado o no)"""
        if self.customer:
            return self.customer.get_full_name()
        return self.customer_name or 'Cliente Anónimo'
    
    def calculate_totals(self):
        """Calcula subtotal y total basado en los items"""
        items = self.items.all()
        self.subtotal = sum(item.subtotal for item in items)
        self.total = self.subtotal - self.discount
        
        # Calcular balance según método de pago
        if self.payment_method == 'account':
            # Cuenta corriente - calcular saldo pendiente
            self.balance = self.total - self.paid_amount
            if self.balance <= 0:
                self.payment_status = 'paid'
                self.balance = 0
            elif self.paid_amount > 0:
                self.payment_status = 'partial'
            else:
                self.payment_status = 'pending'
        else:
            # Otros métodos de pago - considerado como pagado
            self.paid_amount = self.total
            self.balance = 0
            self.payment_status = 'paid'
        
        self.save()


class SaleItem(models.Model):
    """
    Modelo de items/productos en una venta
    """
    sale = models.ForeignKey(
        Sale,
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name='Venta'
    )
    
    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        related_name='sale_items',
        verbose_name='Producto'
    )
    
    quantity = models.IntegerField(
        default=1,
        verbose_name='Cantidad'
    )
    
    unit_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='Precio Unitario',
        help_text='Precio al momento de la venta'
    )
    
    subtotal = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='Subtotal'
    )
    
    class Meta:
        verbose_name = 'Item de Venta'
        verbose_name_plural = 'Items de Venta'
    
    def __str__(self):
        return f"{self.quantity}x {self.product.name}"
    
    def save(self, *args, **kwargs):
        """Calcula el subtotal antes de guardar"""
        self.subtotal = self.quantity * self.unit_price
        super().save(*args, **kwargs)
