"""
Vistas para servicios
"""
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import Service
from .serializers import ServiceSerializer
from core.permissions import IsAdminOrReadOnly

class ServiceViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión de servicios
    """
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
    
    def get_queryset(self):
        queryset = Service.objects.all()
        
        # Filtros
        search = self.request.query_params.get('search', None)
        device_brand = self.request.query_params.get('device_brand', None)
        is_active = self.request.query_params.get('is_active', None)
        
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(device_brand__icontains=search) |
                Q(device_model__icontains=search) |
                Q(description__icontains=search)
            )
        
        if device_brand:
            queryset = queryset.filter(device_brand__icontains=device_brand)
        
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active == 'true')
        
        return queryset
