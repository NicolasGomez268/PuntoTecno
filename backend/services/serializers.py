"""
Serializadores para servicios
"""
from rest_framework import serializers
from .models import Service

class ServiceSerializer(serializers.ModelSerializer):
    """Serializador para servicios"""
    
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Service
        fields = [
            'id', 'name', 'description', 'device_brand', 'device_model',
            'base_price', 'estimated_time', 'is_active', 'full_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_full_name(self, obj):
        return str(obj)
