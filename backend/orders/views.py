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
    
    @action(detail=False, methods=['get'])
    def caja(self, request):
        """
        Retorna datos de caja/ingresos para un período determinado.
        GET /api/orders/orders/caja/?period=today|week|month
        GET /api/orders/orders/caja/?date_from=YYYY-MM-DD&date_to=YYYY-MM-DD
        """
        from datetime import date

        period = request.query_params.get('period', 'month')
        date_from_param = request.query_params.get('date_from')
        date_to_param = request.query_params.get('date_to')

        today = date.today()

        if date_from_param and date_to_param:
            try:
                date_from = datetime.strptime(date_from_param, '%Y-%m-%d').date()
                date_to = datetime.strptime(date_to_param, '%Y-%m-%d').date()
            except ValueError:
                return Response(
                    {'error': 'Formato de fecha inválido. Use YYYY-MM-DD'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        elif period == 'today':
            date_from = today
            date_to = today
        elif period == 'week':
            date_from = today - timedelta(days=today.weekday())  # lunes de esta semana
            date_to = today
        else:  # month
            date_from = today.replace(day=1)
            date_to = today

        # Órdenes entregadas en el período (usando delivered_date o received_date)
        delivered_orders = RepairOrder.objects.filter(
            status='delivered',
            delivered_date__date__gte=date_from,
            delivered_date__date__lte=date_to
        ).select_related('customer')

        # Si no tienen delivered_date se usan las recibidas en el período
        delivered_fallback = RepairOrder.objects.filter(
            status='delivered',
            delivered_date__isnull=True,
            received_date__date__gte=date_from,
            received_date__date__lte=date_to
        ).select_related('customer')

        # Combinar ambos querysets
        from itertools import chain
        all_delivered = list(chain(delivered_orders, delivered_fallback))

        # Calcular totales
        total_income = sum(float(o.final_cost or o.estimated_cost or 0) for o in all_delivered)
        total_parts_cost = sum(float(o.parts_cost or 0) for o in all_delivered)
        total_labor_profit = sum(o.labor_profit() for o in all_delivered)

        # Saldo pendiente total (todas las órdenes, sin importar período)
        pending_balance_total = RepairOrder.objects.filter(
            balance__gt=0
        ).aggregate(total=Sum('balance'))['total'] or 0

        # Órdenes con saldo pendiente
        pending_orders_qs = RepairOrder.objects.filter(
            balance__gt=0
        ).select_related('customer').order_by('-received_date')

        def order_to_dict(o):
            customer = o.customer
            return {
                'id': o.id,
                'order_number': o.order_number,
                'customer_name': f"{customer.first_name} {customer.last_name}" if customer else "—",
                'customer_phone': customer.phone if customer else "",
                'device_type': o.get_device_type_display(),
                'brand': o.device_brand,
                'status': o.status,
                'status_display': o.get_status_display(),
                'final_cost': float(o.final_cost or o.estimated_cost or 0),
                'parts_cost': float(o.parts_cost or 0),
                'labor_profit': o.labor_profit(),
                'paid_amount': float(o.paid_amount or 0),
                'balance': float(o.balance or 0),
                'payment_method': o.payment_method,
                'payment_status': o.payment_status,
                'received_date': o.received_date.strftime('%Y-%m-%d') if o.received_date else None,
                'delivered_date': o.delivered_date.strftime('%Y-%m-%d') if o.delivered_date else None,
            }

        return Response({
            'period': period if not (date_from_param and date_to_param) else 'custom',
            'date_from': date_from.strftime('%Y-%m-%d'),
            'date_to': date_to.strftime('%Y-%m-%d'),
            'summary': {
                'total_income': total_income,
                'total_parts_cost': total_parts_cost,
                'total_labor_profit': total_labor_profit,
                'delivered_count': len(all_delivered),
                'pending_balance_total': float(pending_balance_total),
                'pending_orders_count': pending_orders_qs.count(),
            },
            'delivered_orders': [order_to_dict(o) for o in all_delivered],
            'pending_orders': [order_to_dict(o) for o in pending_orders_qs],
        })

    @action(detail=True, methods=['post'])
    def add_payment(self, request, pk=None):
        """
        Registra un pago adicional sobre una orden con saldo pendiente
        """
        order = self.get_object()
        
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
