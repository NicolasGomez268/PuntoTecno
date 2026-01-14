"""
Modelos para servicios y presupuestos
"""
from django.db import models

class Service(models.Model):
    """
    Modelo de servicios para generar presupuestos
    Ejemplo: 'Reparación de pantalla Samsung A53'
    """
    name = models.CharField(
        max_length=200,
        verbose_name='Nombre del Servicio'
    )
    
    description = models.TextField(
        blank=True,
        verbose_name='Descripción'
    )
    
    device_brand = models.CharField(
        max_length=100,
        blank=True,
        verbose_name='Marca del Equipo'
    )
    
    device_model = models.CharField(
        max_length=100,
        blank=True,
        verbose_name='Modelo del Equipo'
    )
    
    base_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='Precio Base'
    )
    
    estimated_time = models.CharField(
        max_length=50,
        blank=True,
        verbose_name='Tiempo Estimado',
        help_text='Ej: 2-3 días'
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
        verbose_name = 'Servicio'
        verbose_name_plural = 'Servicios'
        ordering = ['name']
    
    def __str__(self):
        if self.device_brand and self.device_model:
            return f"{self.name} - {self.device_brand} {self.device_model}"
        return self.name
