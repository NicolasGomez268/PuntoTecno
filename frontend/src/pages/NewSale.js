import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { customersService, inventoryService, salesService } from '../services/api';

/**
 * Página de punto de venta - Nueva venta
 */
const NewSale = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchProduct, setSearchProduct] = useState('');
  const [formData, setFormData] = useState({
    customer: '',
    customer_name: '',
    discount: '0',
    payment_method: 'cash',
    paid_amount: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsData, customersData] = await Promise.all([
        inventoryService.getProducts(),
        customersService.getAll()
      ]);
      // Manejar respuesta paginada o array directo
      const productsArray = Array.isArray(productsData) ? productsData : (productsData?.results || []);
      const customersArray = Array.isArray(customersData) ? customersData : (customersData?.results || []);
      setProducts(productsArray);
      setCustomers(customersArray);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setProducts([]);
      setCustomers([]);
    }
  };

  const filteredProducts = Array.isArray(products) ? products.filter(p =>
    p.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchProduct.toLowerCase())
  ) : [];

  const addToCart = (product) => {
    const existing = cart.find(item => item.product === product.id);
    if (existing) {
      if (existing.quantity < product.quantity) {
        setCart(cart.map(item =>
          item.product === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      } else {
        // Notificación mejorada para stock insuficiente
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-start gap-3 z-50 max-w-md';
        notification.innerHTML = `
          <svg class="w-6 h-6 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
          <div class="flex-1">
            <p class="font-bold text-sm mb-1">Stock Insuficiente</p>
            <p class="text-sm">El producto "${product.name}" solo tiene ${product.quantity} unidades disponibles y ya has agregado ${existing.quantity} al carrito.</p>
          </div>
          <button onclick="this.parentElement.remove()" class="text-white hover:text-gray-200 flex-shrink-0">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
      }
    } else {
      if (product.quantity > 0) {
        setCart([...cart, {
          product: product.id,
          product_name: product.name,
          product_sku: product.sku,
          quantity: 1,
          unit_price: product.sale_price,
          max_stock: product.quantity
        }]);
      } else {
        // Notificación mejorada para producto sin stock
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-start gap-3 z-50 max-w-md';
        notification.innerHTML = `
          <svg class="w-6 h-6 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <div class="flex-1">
            <p class="font-bold text-sm mb-1">Producto Sin Stock</p>
            <p class="text-sm">El producto "${product.name}" (SKU: ${product.sku}) no tiene unidades disponibles en el inventario.</p>
            <p class="text-xs mt-1 text-red-100">Por favor, verifica el stock antes de intentar venderlo.</p>
          </div>
          <button onclick="this.parentElement.remove()" class="text-white hover:text-gray-200 flex-shrink-0">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
      }
    }
    setSearchProduct('');
  };

  const updateQuantity = (productId, newQuantity) => {
    const item = cart.find(i => i.product === productId);
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else if (newQuantity <= item.max_stock) {
      setCart(cart.map(item =>
        item.product === productId
          ? { ...item, quantity: newQuantity }
          : item
      ));
    } else {
      // Notificación mejorada para límite de stock
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-orange-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-start gap-3 z-50 max-w-md';
      notification.innerHTML = `
        <svg class="w-6 h-6 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div class="flex-1">
          <p class="font-bold text-sm mb-1">Límite de Stock Alcanzado</p>
          <p class="text-sm">El producto "${item.product_name}" solo tiene ${item.max_stock} unidades disponibles en inventario.</p>
          <p class="text-xs mt-1 text-orange-100">Stock máximo: ${item.max_stock} unidades</p>
        </div>
        <button onclick="this.parentElement.remove()" class="text-white hover:text-gray-200 flex-shrink-0">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      `;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 4000);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product !== productId));
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() - parseFloat(formData.discount || 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert('Agregue al menos un producto a la venta');
      return;
    }

    try {
      setLoading(true);

      const saleData = {
        customer: formData.customer || null,
        customer_name: formData.customer_name,
        discount: parseFloat(formData.discount) || 0,
        payment_method: formData.payment_method,
        notes: formData.notes,
        items: cart.map(item => ({
          product: item.product,
          quantity: item.quantity,
          unit_price: item.unit_price
        }))
      };

      await salesService.createSale(saleData);
      
      // Mostrar notificación de éxito
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 flex items-center gap-3';
      toast.innerHTML = `
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span class="font-medium">Venta registrada exitosamente</span>
      `;
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.style.transition = 'opacity 0.5s';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
      }, 3000);
      
      setTimeout(() => navigate('/sales'), 500);
    } catch (error) {
      console.error('Error al crear venta:', error);
      alert('Error al registrar la venta. ' + (error.response?.data?.detail || 'Verifica los datos.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/sales')}
            className="text-primary hover:text-primary/80 font-medium mb-4 flex items-center"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a ventas
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Nueva Venta</h1>
          <p className="text-gray-600 mt-2">Punto de venta</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Panel izquierdo - Productos */}
            <div className="lg:col-span-2 space-y-6">
              {/* Búsqueda de productos */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Agregar Productos</h3>
                <input
                  type="text"
                  placeholder="Buscar producto por nombre o código..."
                  value={searchProduct}
                  onChange={(e) => setSearchProduct(e.target.value)}
                  className="input-field mb-4"
                />
                {searchProduct && (
                  <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                    {filteredProducts.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No se encontraron productos
                      </div>
                    ) : (
                      filteredProducts.slice(0, 10).map(product => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => addToCart(product)}
                          className="w-full p-3 hover:bg-gray-50 border-b border-gray-200 last:border-0 text-left transition-colors"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium text-gray-900">{product.name}</p>
                              <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900">
                                ${product.sale_price.toLocaleString('es-AR')}
                              </p>
                              <p className="text-sm text-gray-500">
                                Stock: {product.quantity}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Carrito */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Carrito ({cart.length} items)
                </h3>
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <p>El carrito está vacío</p>
                    <p className="text-sm mt-1">Busca y agrega productos</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.product} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.product_name}</p>
                          <p className="text-sm text-gray-500">SKU: {item.product_sku}</p>
                          <p className="text-sm text-gray-500">
                            ${item.unit_price.toLocaleString('es-AR')} c/u
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.product, parseInt(e.target.value) || 0)}
                            className="w-16 text-center border border-gray-300 rounded"
                            min="1"
                            max={item.max_stock}
                          />
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-right min-w-[100px]">
                          <p className="font-semibold text-gray-900">
                            ${(item.quantity * item.unit_price).toLocaleString('es-AR')}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product)}
                          className="text-red-600 hover:text-red-700"
                          title="Eliminar"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Panel derecho - Resumen y pago */}
            <div className="space-y-6">
              {/* Cliente */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Cliente</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cliente Registrado
                    </label>
                    <select
                      name="customer"
                      value={formData.customer}
                      onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                      className="input-field"
                    >
                      <option value="">Seleccionar cliente...</option>
                      {customers.map(customer => (
                        <option key={customer.id} value={customer.id}>
                          {customer.last_name}, {customer.first_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="text-center text-sm text-gray-500">- O -</div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del Cliente
                    </label>
                    <input
                      type="text"
                      name="customer_name"
                      value={formData.customer_name}
                      onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                      placeholder="Cliente sin registrar..."
                      className="input-field"
                      disabled={formData.customer !== ''}
                    />
                  </div>
                </div>
              </div>

              {/* Resumen */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal:</span>
                    <span className="font-medium">${calculateSubtotal().toLocaleString('es-AR')}</span>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Descuento:</label>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">$</span>
                      <input
                        type="number"
                        name="discount"
                        value={formData.discount}
                        onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                        className="input-field"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>Total:</span>
                      <span className="text-primary">${calculateTotal().toLocaleString('es-AR')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Método de pago */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Método de Pago</h3>
                <select
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                  required
                  className="input-field"
                >
                  <option value="cash">Efectivo</option>
                  <option value="card">Tarjeta</option>
                  <option value="transfer">Transferencia</option>
                  <option value="multiple">Múltiple</option>
                  <option value="account">Cuenta Corriente</option>
                </select>
                
                {/* Campo para pago parcial cuando es cuenta corriente */}
                {formData.payment_method === 'account' && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monto a pagar ahora (opcional)
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-lg">$</span>
                      <input
                        type="number"
                        name="paid_amount"
                        value={formData.paid_amount}
                        onChange={(e) => setFormData({ ...formData, paid_amount: e.target.value })}
                        placeholder="0.00"
                        className="input-field"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Saldo pendiente: ${(calculateTotal() - (parseFloat(formData.paid_amount) || 0)).toLocaleString('es-AR')}
                    </p>
                  </div>
                )}
              </div>

              {/* Notas */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas (opcional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="input-field"
                  placeholder="Observaciones..."
                />
              </div>

              {/* Botones */}
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={loading || cart.length === 0}
                  className="w-full btn-primary py-4 text-lg disabled:opacity-50"
                >
                  {loading ? 'Procesando...' : `Cobrar $${calculateTotal().toLocaleString('es-AR')}`}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/sales')}
                  className="w-full btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default NewSale;
