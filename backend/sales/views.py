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
