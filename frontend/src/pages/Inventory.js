import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Pagination from '../components/Pagination';
import { inventoryService } from '../services/api';

/**
 * Página principal de Inventario
 * Lista todos los productos con búsqueda y filtros
 */
const Inventory = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadProducts();
  }, [currentPage]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await inventoryService.getProducts({ page: currentPage, page_size: 50 });
      const productsArray = data.results || data;
      setProducts(Array.isArray(productsArray) ? productsArray : []);
      
      // Calcular total de páginas
      if (data.count) {
        setTotalPages(Math.ceil(data.count / 50));
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;

    try {
      await inventoryService.deleteProduct(id);
      loadProducts();
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      
      let errorMessage = 'Error al eliminar el producto.';
      
      if (error.response?.status === 403) {
        errorMessage = '🔒 No tienes permisos para eliminar productos. Solo los administradores pueden realizar esta acción.';
      } else if (error.response?.status === 404) {
        errorMessage = '❌ Producto no encontrado.';
      } else if (error.response?.status === 400) {
        errorMessage = '⚠️ No se puede eliminar este producto porque está siendo utilizado.';
      }
      
      // Crear notificación estilizada
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-2xl z-50 max-w-md animate-slide-in';
      notification.innerHTML = `
        <div class="flex items-start gap-3">
          <div class="flex-shrink-0">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="flex-1">
            <p class="font-semibold text-lg mb-1">Error</p>
            <p class="text-sm">${errorMessage}</p>
          </div>
          <button onclick="this.parentElement.parentElement.remove()" class="flex-shrink-0 text-white hover:text-gray-200">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      `;
      document.body.appendChild(notification);
      
      // Auto-eliminar después de 6 segundos
      setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
      }, 6000);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const lowStockProducts = products.filter(p => p.quantity <= p.min_stock);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inventario</h1>
            <p className="text-gray-600 mt-2">Gestión de productos y stock</p>
          </div>
          <button
            onClick={() => navigate('/inventory/new')}
            className="btn-primary flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Producto
          </button>
        </div>

        {/* Alertas de stock bajo */}
        {lowStockProducts.length > 0 && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Stock bajo</h3>
                <p className="text-sm text-red-700 mt-1">
                  {lowStockProducts.length} producto(s) con stock por debajo del mínimo
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Total Productos</p>
            <p className="text-3xl font-bold text-gray-900">{products.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">En Stock</p>
            <p className="text-3xl font-bold text-green-600">
              {products.filter(p => p.quantity > p.min_stock).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Stock Bajo</p>
            <p className="text-3xl font-bold text-red-600">{lowStockProducts.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Valor Total</p>
            <p className="text-3xl font-bold text-blue-600">
              ${products.reduce((sum, p) => sum + ((p.sale_price || 0) * (p.quantity || 0)), 0).toLocaleString('es-AR')}
            </p>
          </div>
        </div>

        {/* Búsqueda y filtros */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
              <input
                type="text"
                placeholder="Buscar por nombre o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="input-field"
              >
                <option value="all">Todas las categorías</option>
                <option value="parts">Repuestos</option>
                <option value="accessories">Accesorios</option>
                <option value="tools">Herramientas</option>
                <option value="consumables">Consumibles</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabla de productos */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-700 text-sm">Código</th>
                  <th className="text-left p-4 font-semibold text-gray-700 text-sm">Producto</th>
                  <th className="text-left p-4 font-semibold text-gray-700 text-sm">Categoría</th>
                  <th className="text-left p-4 font-semibold text-gray-700 text-sm">Stock</th>
                  <th className="text-left p-4 font-semibold text-gray-700 text-sm">Precio</th>
                  <th className="text-left p-4 font-semibold text-gray-700 text-sm">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-500">
                      No se encontraron productos
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <span className="font-medium text-gray-900">{product.sku}</span>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          {product.description && (
                            <p className="text-sm text-gray-500 truncate max-w-xs">
                              {product.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {product.category_display || product.category}
                        </span>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className={`font-semibold ${
                            product.quantity <= product.min_stock 
                              ? 'text-red-600' 
                              : 'text-green-600'
                          }`}>
                            {product.quantity}
                          </p>
                          <p className="text-xs text-gray-500">
                            Mín: {product.min_stock}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-medium text-gray-900">
                          ${product.sale_price?.toLocaleString('es-AR')}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/inventory/${product.id}`)}
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                            title="Ver detalles"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => navigate(`/inventory/${product.id}/edit`)}
                            className="text-primary hover:text-primary/80 font-medium text-sm"
                            title="Editar"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600 hover:text-red-700 font-medium text-sm"
                            title="Eliminar"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Paginación */}
          {!loading && filteredProducts.length > 0 && (
            <div className="mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Inventory;

