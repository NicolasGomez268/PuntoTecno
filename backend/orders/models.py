"""
Modelos para el sistema de órdenes de reparación
"""
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Customer(models.Model):
    """
    Modelo de clientes
    """
    dni = models.CharField(
        max_length=20,
        unique=True,
        verbose_name='DNI'
    )
    
    customer_number = models.CharField(
        max_length=20,
        blank=True,
        verbose_name='Número de Cliente'
    )
    
    first_name = models.CharField(
        max_length=100,
        verbose_name='Nombre'
    )
    
    last_name = models.CharField(
        max_length=100,
        verbose_name='Apellido'
    )
    
    phone = models.CharField(
        max_length=20,
        verbose_name='Teléfono'
    )
    
    email = models.EmailField(
        blank=True,
        verbose_name='Email'
    )
    
    address = models.TextField(
        blank=True,
        verbose_name='Dirección'
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Fecha de registro'
    )
    
    class Meta:
        verbose_name = 'Cliente'
        verbose_name_plural = 'Clientes'
        ordering = ['last_name', 'first_name']
    
    def __str__(self):
        return f"{self.last_name}, {self.first_name}"
    
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}"


class RepairOrder(models.Model):
    """
    Modelo de órdenes de reparación
    """
    STATUS_CHOICES = (
        ('received', 'Recibido'),
        ('in_service', 'En Servicio'),
        ('repaired', 'Reparado'),
        ('not_repaired', 'No Reparado'),
        ('not_solved', 'No Solucionado'),
        ('ready', 'Listo para Entrega'),
        ('delivered', 'Entregado'),
        ('cancelled', 'Cancelado'),
    )
    
    DEVICE_TYPES = (
        ('phone', 'Celular'),
        ('tablet', 'Tablet'),
        ('laptop', 'Notebook'),
        ('desktop', 'PC de Escritorio'),
        ('other', 'Otro'),
    )
    
    order_number = models.CharField(
        max_length=20,
        unique=True,
        verbose_name='Número de orden'
    )
    
    customer = models.ForeignKey(
        Customer,
        on_delete=models.PROTECT,
        related_name='orders',
        verbose_name='Cliente'
    )
    
    device_type = models.CharField(
        max_length=20,
        choices=DEVICE_TYPES,
        verbose_name='Tipo de dispositivo'
    )
    
    device_brand = models.CharField(
        max_length=100,
        verbose_name='Marca'
    )
    
    device_model = models.CharField(
        max_length=100,
        verbose_name='Modelo'
    )
    
    device_color = models.CharField(
        max_length=50,
        blank=True,
        verbose_name='Color'
    )
    
    device_serial = models.CharField(
        max_length=100,
        blank=True,
        verbose_name='Serial/IMEI'
    )
    
    security_data = models.TextField(
        blank=True,
        verbose_name='Datos de Seguridad',
        help_text='Clave, patrón, PIN, etc.'
    )
    
    problem_description = models.TextField(
        verbose_name='Descripción del problema'
    )
    
    diagnosis = models.TextField(
        blank=True,
        verbose_name='Diagnóstico'
    )
    
    repair_notes = models.TextField(
        blank=True,
        verbose_name='Notas de reparación'
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='received',
        verbose_name='Estado'
    )
    
    estimated_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name='Costo estimado'
    )
    
    final_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name='Costo final'
    )
    
    deposit_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        verbose_name='Adelanto/Seña'
    )
    
    PAYMENT_METHOD_CHOICES = (
        ('cash', 'Efectivo'),
        ('transfer', 'Transferencia'),
        ('not_paid', 'Sin Abonar'),
        ('account', 'Cuenta Corriente'),
    )
    
    PAYMENT_STATUS_CHOICES = (
        ('paid', 'Pagado'),
        ('partial', 'Pago Parcial'),
        ('pending', 'Pendiente'),
    )
    
    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES,
        default='not_paid',
        verbose_name='Método de Pago'
    )
    
    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default='pending',
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
    
    general_observations = models.TextField(
        blank=True,
        verbose_name='Observaciones Generales'
    )
    
    assigned_to = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_orders',
        verbose_name='Asignado a'
    )
    
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_orders',
        verbose_name='Creado por'
    )
    
    received_date = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Fecha de recepción'
    )
    
    estimated_delivery = models.DateField(
        null=True,
        blank=True,
        verbose_name='Entrega estimada'
    )
    
    delivered_date = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Fecha de entrega'
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Última actualización'
    )
    
    class Meta:
        verbose_name = 'Orden de reparación'
        verbose_name_plural = 'Órdenes de reparación'
        ordering = ['-received_date']
    
    def __str__(self):
        return f"Orden {self.order_number} - {self.customer.get_full_name()}"
    
    def save(self, *args, **kwargs):
        if not self.order_number:
            # Generar número de orden automático
            last_order = RepairOrder.objects.all().order_by('-id').first()
            if last_order and last_order.order_number:
                last_number = int(last_order.order_number.split('-')[1])
                new_number = last_number + 1
            else:
                new_number = 1
            self.order_number = f"ORD-{new_number:06d}"
        
        # Calcular balance si es cuenta corriente
        if self.payment_method == 'account' and self.estimated_cost:
            self.balance = self.estimated_cost - self.paid_amount
            
            # Actualizar estado de pago
            if self.balance <= 0:
                self.payment_status = 'paid'
                self.balance = 0
            elif self.paid_amount > 0:
                self.payment_status = 'partial'
            else:
                self.payment_status = 'pending'
        else:
            # Para otros métodos, si hay adelanto, considerar pagado ese monto
            if self.deposit_amount > 0:
                self.paid_amount = self.deposit_amount
                if self.estimated_cost:
                    self.balance = self.estimated_cost - self.paid_amount
        
        super().save(*args, **kwargs)
    
    def remaining_balance(self):
        """Calcula el saldo pendiente"""
        if self.final_cost:
            return self.final_cost - self.deposit_amount
        return 0


class OrderStatusHistory(models.Model):
    """
    Historial de cambios de estado de una orden
    """
    order = models.ForeignKey(
        RepairOrder,
        on_delete=models.CASCADE,
        related_name='status_history',
        verbose_name='Orden'
    )
    
    previous_status = models.CharField(
        max_length=20,
        verbose_name='Estado anterior'
    )
    
    new_status = models.CharField(
        max_length=20,
        verbose_name='Nuevo estado'
    )
    
    notes = models.TextField(
        blank=True,
        verbose_name='Notas'
    )
    
    changed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        verbose_name='Modificado por'
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Fecha del cambio'
    )
    
    class Meta:
        verbose_name = 'Historial de estado'
        verbose_name_plural = 'Historial de estados'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.order.order_number}: {self.previous_status} → {self.new_status}"
