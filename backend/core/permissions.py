"""
Permisos personalizados
"""
from rest_framework import permissions

class IsAdmin(permissions.BasePermission):
    """
    Permiso que solo permite acceso a usuarios con rol de administrador
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'admin'


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Permiso que permite lectura a todos los usuarios autenticados
    pero solo escritura a administradores
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        # Permitir POST (crear) a empleados y admin
        if request.method == 'POST':
            return request.user and request.user.is_authenticated
        # Solo admin puede UPDATE y DELETE
        return request.user and request.user.is_authenticated and request.user.role == 'admin'
