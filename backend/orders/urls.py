"""
URLs para la app Orders
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustomerViewSet, RepairOrderViewSet

router = DefaultRouter()
router.register(r'customers', CustomerViewSet, basename='customer')
router.register(r'orders', RepairOrderViewSet, basename='order')

urlpatterns = [
    path('', include(router.urls)),
]
