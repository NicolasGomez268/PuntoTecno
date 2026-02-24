"""
Vistas para el sistema de ventas
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
from .models import Sale, SaleItem
from .serializers import SaleSerializer, SaleListSerializer
from core.permissions import IsAdmin


class SaleViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión de ventas
    """
    queryset = Sale.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return SaleListSerializer
        return SaleSerializer
    
    def get_queryset(self):
        queryset = Sale.objects.select_related('customer', 'employee').prefetch_related('items__product')
        
        # Filtros
        search = self.request.query_params.get('search', None)
        payment_method = self.request.query_params.get('payment_method', None)
        date_from = self.request.query_params.get('date_from', None)
        date_to = self.request.query_params.get('date_to', None)
        
        if search:
            queryset = queryset.filter(
                Q(sale_number__icontains=search) |
                Q(customer_name__icontains=search) |
                Q(customer__first_name__icontains=search) |
                Q(customer__last_name__icontains=search)
            )
        
        if payment_method:
            queryset = queryset.filter(payment_method=payment_method)
        
        if date_from:
            queryset = queryset.filter(date__gte=date_from)
        
        if date_to:
            queryset = queryset.filter(date__lte=date_to)
        
        return queryset.order_by('-date')
    
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """
        Retorna estadísticas del dashboard de ventas
        """
        today = timezone.now().date()
        month_start = today.replace(day=1)
        
        # Ventas del día
        today_sales = Sale.objects.filter(date__date=today)
        sales_today_count = today_sales.count()
        sales_today_total = today_sales.aggregate(
            total=Sum('total')
        )['total'] or 0
        
        # Ventas del mes
        month_sales = Sale.objects.filter(date__gte=month_start)
        sales_month_count = month_sales.count()
        sales_month_total = month_sales.aggregate(
            total=Sum('total')
        )['total'] or 0
        
        # Productos más vendidos del mes
        top_products = SaleItem.objects.filter(
            sale__date__gte=month_start
        ).values(
            'product__name', 'product__sku'
        ).annotate(
            quantity=Sum('quantity'),
            total=Sum('subtotal')
        ).order_by('-quantity')[:5]
        
        # Ventas por método de pago (mes actual)
        payment_methods = month_sales.values('payment_method').annotate(
            count=Count('id'),
            total=Sum('total')
        ).order_by('-total')
        
        return Response({
            'sales_today': {
                'count': sales_today_count,
                'total': float(sales_today_total)
            },
            'sales_month': {
                'count': sales_month_count,
                'total': float(sales_month_total)
            },
            'top_products': list(top_products),
            'payment_methods': list(payment_methods)
        })
    
    @action(detail=True, methods=['post'])
    def add_payment(self, request, pk=None):
        """
        Registra un pago adicional sobre una venta fiada
        """
        sale = self.get_object()
        
        # Validar que sea cuenta corriente
        if sale.payment_method != 'account':
            return Response(
                {'error': 'Solo se pueden agregar pagos a ventas en cuenta corriente'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validar que tenga saldo pendiente
        if sale.balance <= 0:
            return Response(
                {'error': 'Esta venta no tiene saldo pendiente'},
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
        if amount > Decimal(str(sale.balance)):
            return Response(
                {'error': f'El monto no puede ser mayor al saldo pendiente (${sale.balance})'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Actualizar la venta
        sale.paid_amount = Decimal(str(sale.paid_amount)) + amount
        sale.balance = Decimal(str(sale.total)) - sale.paid_amount
        
        # Actualizar estado
        if sale.balance <= 0:
            sale.payment_status = 'paid'
            sale.balance = 0
        elif sale.paid_amount > 0:
            sale.payment_status = 'partial'
        
        sale.save()
        
        # Retornar la venta actualizada
        serializer = self.get_serializer(sale)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def caja(self, request):
        """
        Retorna datos de caja de ventas para un período determinado.
        GET /api/sales/sales/caja/?period=today|week|month
        GET /api/sales/sales/caja/?date_from=YYYY-MM-DD&date_to=YYYY-MM-DD
        """
        from datetime import date, datetime

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
            date_from = today - timedelta(days=today.weekday())
            date_to = today
        else:  # month
            date_from = today.replace(day=1)
            date_to = today

        # Ventas del período
        period_sales = Sale.objects.filter(
            date__date__gte=date_from,
            date__date__lte=date_to
        ).prefetch_related('items__product').select_related('customer')

        # Calcular totales del período
        total_income = sum(float(s.total) for s in period_sales)
        total_discount = sum(float(s.discount) for s in period_sales)

        # Ganancia = precio de venta - costo producto para cada item
        total_profit = 0
        total_cost = 0
        for sale in period_sales:
            for item in sale.items.all():
                cost = float(item.product.unit_price) * item.quantity
                revenue = float(item.unit_price) * item.quantity
                total_cost += cost
                total_profit += (revenue - cost)

        # Saldo pendiente total en ventas (cuenta corriente)
        pending_sales_qs = Sale.objects.filter(
            balance__gt=0
        ).prefetch_related('items__product').select_related('customer').order_by('-date')

        pending_balance_total = pending_sales_qs.aggregate(
            total=Sum('balance')
        )['total'] or 0

        def sale_to_dict(s):
            sale_profit = 0
            sale_cost = 0
            for item in s.items.all():
                cost = float(item.product.unit_price) * item.quantity
                revenue = float(item.unit_price) * item.quantity
                sale_cost += cost
                sale_profit += (revenue - cost)
            customer_display = ''
            if s.customer:
                customer_display = f"{s.customer.first_name} {s.customer.last_name}"
            elif s.customer_name:
                customer_display = s.customer_name
            else:
                customer_display = 'Consumidor Final'
            return {
                'id': s.id,
                'sale_number': s.sale_number,
                'customer_name': customer_display,
                'items_count': s.items.count(),
                'subtotal': float(s.subtotal),
                'discount': float(s.discount),
                'total': float(s.total),
                'cost': round(sale_cost, 2),
                'profit': round(sale_profit, 2),
                'paid_amount': float(s.paid_amount),
                'balance': float(s.balance),
                'payment_method': s.payment_method,
                'payment_status': s.payment_status,
                'date': s.date.strftime('%Y-%m-%d'),
            }

        return Response({
            'period': period if not (date_from_param and date_to_param) else 'custom',
            'date_from': date_from.strftime('%Y-%m-%d'),
            'date_to': date_to.strftime('%Y-%m-%d'),
            'summary': {
                'total_income': round(total_income, 2),
                'total_cost': round(total_cost, 2),
                'total_profit': round(total_profit, 2),
                'total_discount': round(total_discount, 2),
                'sales_count': len(list(period_sales)),
                'pending_balance_total': float(pending_balance_total),
                'pending_sales_count': pending_sales_qs.count(),
            },
            'sales': [sale_to_dict(s) for s in period_sales],
            'pending_sales': [sale_to_dict(s) for s in pending_sales_qs],
        })

    @action(detail=False, methods=['get'])
    def daily_report(self, request):
        """
        Reporte de ventas del día (cierre de caja)
        """
        date = request.query_params.get('date', timezone.now().date())
        
        sales = Sale.objects.filter(date__date=date)
        
        # Total por método de pago
        by_payment = sales.values('payment_method').annotate(
            count=Count('id'),
            total=Sum('total')
        )
        
        # Detalle de ventas
        sales_detail = SaleListSerializer(sales, many=True).data
        
        return Response({
            'date': date,
            'total_sales': sales.count(),
            'total_amount': sales.aggregate(Sum('total'))['total'] or 0,
            'by_payment_method': list(by_payment),
            'sales': sales_detail
        })
