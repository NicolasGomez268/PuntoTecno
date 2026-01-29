"""
URLs para la app Sales
"""
from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import SaleViewSet

router = SimpleRouter()
router.register(r'sales', SaleViewSet, basename='sale')

urlpatterns = [
    path('', include(router.urls)),
]
