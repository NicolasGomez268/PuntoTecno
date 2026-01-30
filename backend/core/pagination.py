"""
Clases de paginación personalizadas
"""
from rest_framework.pagination import PageNumberPagination


class DynamicPageSizePagination(PageNumberPagination):
    """
    Paginación que permite al cliente especificar el tamaño de página
    mediante el parámetro ?page_size=X
    """
    page_size = 50  # Valor por defecto
    page_size_query_param = 'page_size'  # Permite ?page_size=X
    max_page_size = 1000  # Límite máximo para prevenir abuso
