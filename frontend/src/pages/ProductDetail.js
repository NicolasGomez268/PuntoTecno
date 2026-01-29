import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { inventoryService } from '../services/api';

/**
 * Vista detallada de un producto con movimientos de stock
 */
const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockForm, setStockForm] = useState({
    movementType: 'in',
    quantity: '',
    reason: ''
  });

  useEffect(() => {
    loadProductData();
  }, [id]);

  const loadProductData = async () => {
    try {
      setLoading(true);
      const [productData, movementsData] = await Promise.all([
        inventoryService.getProductById(id),
        inventoryService.getStockMovements({ product: id })
      ]);
      
      setProduct(productData);
      const movementsArray = movementsData.results || movementsData;
      setMovements(Array.isArray(movementsArray) ? movementsArray : []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      alert('Error al cargar el producto');
      navigate('/inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleStockUpdate = async (e) => {
    e.preventDefault();
    
    try {
      await inventoryService.updateStock(
        id,
        stockForm.movementType,
        parseInt(stockForm.quantity),
        stockForm.reason
      );
      
      setShowStockModal(false);
      setStockForm({ movementType: 'in', quantity: '', reason: '' });
      loadProductData();
    } catch (error) {
      console.error('Error al actualizar stock:', error);
      console.error('Response data:', error.response?.data);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Error al actualizar el stock';
      alert(errorMessage);
    }
  };

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
        <div className="mb-8">
          <button
            onClick={() => navigate('/inventory')}
            className="text-primary hover:text-primary/80 font-medium mb-4 flex items-center"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al inventario
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{product?.name}</h1>
              <p className="text-gray-600 mt-2">Código: {product?.sku}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowStockModal(true)}
                className="btn-primary flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
                Ajustar Stock
              </button>
              <button
                onClick={() => navigate(`/inventory/${id}/edit`)}
                className="btn-secondary"
              >
                Editar
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información del producto */}
          <div className="lg:col-span-2 space-y-6">
            {/* Datos principales */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Información del Producto</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Categoría</p>
                  <p className="font-medium text-gray-900 mt-1">
                    {product?.category_display || product?.category}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ubicación</p>
                  <p className="font-medium text-gray-900 mt-1">
                    {product?.location || 'No especificada'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Proveedor</p>
                  <p className="font-medium text-gray-900 mt-1">
                    {product?.supplier || 'No especificado'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Stock Mínimo</p>
                  <p className="font-medium text-gray-900 mt-1">{product?.min_stock}</p>
                </div>
                {product?.description && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Descripción</p>
                    <p className="text-gray-900 mt-1">{product.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Historial de movimientos */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Movimientos de Stock</h2>
              {movements.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hay movimientos registrados</p>
              ) : (
                <div className="space-y-3">
                  {movements.map((movement) => (
                    <div
                      key={movement.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          movement.movement_type === 'in' 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-red-100 text-red-600'
                        }`}>
                          {movement.movement_type === 'in' ? '+' : '-'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {movement.movement_type === 'in' ? 'Entrada' : 'Salida'}: {movement.quantity} unidades
                          </p>
                          <p className="text-sm text-gray-600">{movement.reason}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(movement.created_at).toLocaleString('es-AR')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Realizado por</p>
                        <p className="font-medium text-gray-900">{movement.created_by_name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stock actual */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Actual</h3>
              <div className="text-center">
                <p className={`text-5xl font-bold ${
                  product?.quantity <= product?.min_stock 
                    ? 'text-red-600' 
                    : 'text-green-600'
                }`}>
                  {product?.quantity}
                </p>
                <p className="text-gray-600 mt-2">unidades disponibles</p>
                {product?.quantity <= product?.min_stock && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800 font-medium">
                      ⚠️ Stock por debajo del mínimo
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Precios */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Precios</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Precio de Venta</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${product?.sale_price?.toLocaleString('es-AR')}
                  </p>
                </div>
                {product?.unit_price > 0 && (
                  <>
                    <div>
                      <p className="text-sm text-gray-600">Costo</p>
                      <p className="text-lg font-medium text-gray-900">
                        ${product?.unit_price?.toLocaleString('es-AR')}
                      </p>
                    </div>
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-600">Margen</p>
                      <p className="text-lg font-medium text-green-600">
                        ${(product.sale_price - product.unit_price).toLocaleString('es-AR')}
                        <span className="text-sm ml-2">
                          ({(((product.sale_price - product.unit_price) / product.unit_price) * 100).toFixed(1)}%)
                        </span>
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Valor total en stock */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
              <p className="text-blue-100 text-sm font-medium">Valor Total en Stock</p>
              <p className="text-3xl font-bold mt-2">
                ${((product?.price || 0) * (product?.quantity || 0)).toLocaleString('es-AR')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal ajustar stock */}
      {showStockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Ajustar Stock</h3>
              <button
                onClick={() => setShowStockModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleStockUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Movimiento
                </label>
                <select
                  value={stockForm.movementType}
                  onChange={(e) => setStockForm(prev => ({ ...prev, movementType: e.target.value }))}
                  className="input-field"
                  required
                >
                  <option value="in">Entrada (Agregar)</option>
                  <option value="out">Salida (Retirar)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad
                </label>
                <input
                  type="number"
                  min="1"
                  value={stockForm.quantity}
                  onChange={(e) => setStockForm(prev => ({ ...prev, quantity: e.target.value }))}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motivo
                </label>
                <textarea
                  value={stockForm.reason}
                  onChange={(e) => setStockForm(prev => ({ ...prev, reason: e.target.value }))}
                  rows={3}
                  className="input-field"
                  placeholder="Ej: Compra a proveedor, Uso en reparación..."
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button type="submit" className="btn-primary flex-1">
                  Confirmar
                </button>
                <button
                  type="button"
                  onClick={() => setShowStockModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductDetail;
