"""
Vistas para el sistema de órdenes
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Count, Sum
from django.utils import timezone
from datetime import datetime, timedelta
from decimal import Decimal
from .models import Customer, RepairOrder, OrderStatusHistory
from .serializers import (
    CustomerSerializer,
    RepairOrderSerializer,
    RepairOrderDetailSerializer,
    OrderStatusHistorySerializer  
)
from core.permissions import IsAdminOrReadOnly

class CustomerViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión de clientes
    """
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Customer.objects.all()
        search = self.request.query_params.get('search', None)
        
        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(phone__icontains=search) |
                Q(email__icontains=search)
            )
        
        return queryset
    
    def destroy(self, request, *args, **kwargs):
        """
        Eliminar un cliente - verifica que no tenga órdenes asociadas
        """
        customer = self.get_object()
        
        # Verificar si tiene órdenes
        if customer.orders.exists():
            return Response(
                {
                    'detail': 'No se puede eliminar el cliente porque tiene órdenes de reparación asociadas.',
                    'orders_count': customer.orders.count()
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return super().destroy(request, *args, **kwargs)
    
    @action(detail=True, methods=['get'])
    def orders(self, request, pk=None):
        """
        Retorna todas las órdenes de un cliente
        GET /api/orders/customers/{id}/orders/
        """
        customer = self.get_object()
        orders = customer.orders.all()
        serializer = RepairOrderSerializer(orders, many=True)
        return Response(serializer.data)


class RepairOrderViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión de órdenes de reparación
    """
    queryset = RepairOrder.objects.select_related(
        'customer', 'assigned_to', 'created_by'
    ).all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return RepairOrderDetailSerializer
        return RepairOrderSerializer
    
    def get_queryset(self):
        queryset = RepairOrder.objects.select_related(
            'customer', 'assigned_to', 'created_by'
        ).all()
        
        # Filtros
        search = self.request.query_params.get('search', None)
        status_filter = self.request.query_params.get('status', None)
        device_type = self.request.query_params.get('device_type', None)
        assigned_to = self.request.query_params.get('assigned_to', None)
        date_from = self.request.query_params.get('date_from', None)
        date_to = self.request.query_params.get('date_to', None)
        
        if search:
            queryset = queryset.filter(
                Q(order_number__icontains=search) |
                Q(customer__first_name__icontains=search) |
                Q(customer__last_name__icontains=search) |
                Q(customer__phone__icontains=search) |
                Q(device_brand__icontains=search) |
                Q(device_model__icontains=search) |
                Q(device_serial__icontains=search)
            )
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        if device_type:
            queryset = queryset.filter(device_type=device_type)
        
        if assigned_to:
            queryset = queryset.filter(assigned_to_id=assigned_to)
        
        if date_from:
            queryset = queryset.filter(received_date__gte=date_from)
        
        if date_to:
            queryset = queryset.filter(received_date__lte=date_to)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """
        Retorna estadísticas para el dashboard
        GET /api/orders/orders/dashboard/
        """
        # Contadores por estado
        status_counts = RepairOrder.objects.values('status').annotate(
            count=Count('id')
        )
        
        status_dict = {item['status']: item['count'] for item in status_counts}
        
        # Estadísticas específicas
        total_orders = RepairOrder.objects.count()
        in_service_count = status_dict.get('in_service', 0)
        ready_count = status_dict.get('ready', 0)
        delivered_count = status_dict.get('delivered', 0)
        
        # Órdenes pendientes (no entregadas ni canceladas)
        pending_orders = RepairOrder.objects.exclude(
            status__in=['delivered', 'cancelled']
        ).count()
        
        # Órdenes del mes actual
        current_month = timezone.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        orders_this_month = RepairOrder.objects.filter(
            received_date__gte=current_month
        ).count()
        
        # Ingresos del mes
        revenue_this_month = RepairOrder.objects.filter(
            received_date__gte=current_month,
            status='delivered'
        ).aggregate(
            total=Sum('final_cost')
        )['total'] or 0
        
        # Órdenes próximas a vencer (estimación en los próximos 3 días)
        upcoming_due = RepairOrder.objects.filter(
            status__in=['received', 'in_repair'],
            estimated_delivery__lte=timezone.now().date() + timedelta(days=3),
            estimated_delivery__gte=timezone.now().date()
        ).count()
        
        return Response({
            'total_orders': total_orders,
            'in_service_count': in_service_count,
            'ready_count': ready_count,
            'delivered_count': delivered_count,
            'status_breakdown': status_dict,
            'pending_orders': pending_orders,
            'orders_this_month': orders_this_month,
            'revenue_this_month': float(revenue_this_month),
            'upcoming_due': upcoming_due
        })
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """
        Actualiza el estado de una orden
        POST /api/orders/orders/{id}/update_status/
        Body: {
            "status": "received|in_repair|ready|delivered|cancelled",
            "notes": "Notas opcionales"
        }
        """
        order = self.get_object()
        new_status = request.data.get('status')
        notes = request.data.get('notes', '')
        
        if not new_status:
            return Response(
                {'error': 'El campo status es requerido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if new_status not in dict(RepairOrder.STATUS_CHOICES):
            return Response(
                {'error': 'Estado inválido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        old_status = order.status
        
        # Registrar cambio en el historial
        OrderStatusHistory.objects.create(
            order=order,
            previous_status=old_status,
            new_status=new_status,
            notes=notes,
            changed_by=request.user
        )
        
        # Actualizar estado
        order.status = new_status
        
        # Si se marca como entregado, registrar la fecha
        if new_status == 'delivered' and not order.delivered_date:
            order.delivered_date = timezone.now()
        
        order.save()
        
        serializer = RepairOrderDetailSerializer(order)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def my_orders(self, request):
        """
        Retorna las órdenes asignadas al usuario actual
        GET /api/orders/orders/my_orders/
        """
        orders = RepairOrder.objects.filter(
            assigned_to=request.user
        ).exclude(
            status__in=['delivered', 'cancelled']
        )
        
        serializer = self.get_serializer(orders, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def daily_load(self, request):
        """
        Retorna las órdenes recibidas en un día específico (Carga Diaria)
        GET /api/orders/orders/daily_load/?date=2026-01-13
        Si no se proporciona fecha, retorna las del día actual
        """
        from datetime import date
        
        date_param = request.query_params.get('date')
        if date_param:
            try:
                target_date = datetime.strptime(date_param, '%Y-%m-%d').date()
            except ValueError:
                return Response(
                    {'error': 'Formato de fecha inválido. Use YYYY-MM-DD'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            target_date = date.today()
        
        # Filtrar órdenes recibidas en esa fecha
        orders = RepairOrder.objects.filter(
            received_date__date=target_date
        ).order_by('-received_date')
        
        serializer = self.get_serializer(orders, many=True)
        
        return Response({
            'date': target_date,
            'count': orders.count(),
            'orders': serializer.data
        })
    
    @action(detail=True, methods=['post'])
    def add_payment(self, request, pk=None):
        """
        Registra un pago adicional sobre una orden en cuenta corriente
        """
        order = self.get_object()
        
        # Validar que sea cuenta corriente
        if order.payment_method != 'account':
            return Response(
                {'error': 'Solo se pueden agregar pagos a órdenes en cuenta corriente'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validar que tenga saldo pendiente
        if order.balance <= 0:
            return Response(
                {'error': 'Esta orden no tiene saldo pendiente'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Obtener monto del pago
        amount = request.data.get('amount')
        if not amount:
            return Response(
                {'error': 'Debe especificar el monto del pago'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            amount = Decimal(str(amount))
        except (ValueError, TypeError):
            return Response(
                {'error': 'El monto debe ser un número válido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validar que el monto no sea mayor al saldo
        if amount > Decimal(str(order.balance)):
            return Response(
                {'error': f'El monto no puede ser mayor al saldo pendiente (${order.balance})'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Actualizar la orden
        order.paid_amount = Decimal(str(order.paid_amount)) + amount
        
        # Usar el costo estimado o final según corresponda
        total_cost = order.final_cost if order.final_cost else order.estimated_cost
        if total_cost:
            order.balance = Decimal(str(total_cost)) - order.paid_amount
            
            # Actualizar estado
            if order.balance <= 0:
                order.payment_status = 'paid'
                order.balance = 0
            elif order.paid_amount > 0:
                order.payment_status = 'partial'
        
        order.save()
        
        # Retornar la orden actualizada
        serializer = self.get_serializer(order)
        return Response(serializer.data)
