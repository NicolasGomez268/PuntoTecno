import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { customersService, inventoryService, ordersService } from '../services/api';

const NewOrder = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [products, setProducts] = useState([]);
  const [selectedParts, setSelectedParts] = useState([]);
  const [partSelector, setPartSelector] = useState({ productId: '', quantity: 1 });
  const [partsModified, setPartsModified] = useState(false);
  const [partSearch, setPartSearch] = useState('');
  const [partDropdownOpen, setPartDropdownOpen] = useState(false);
  const partSearchRef = useRef(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    customer: '',
    device_type: 'phone',
    device_brand: '',
    device_model: '',
    device_color: '',
    device_serial: '',
    security_data: '',
    problem_description: '',
    diagnosis: '',
    estimated_cost: '',
    parts_cost: '0',
    deposit_amount: '0',
    payment_method: 'not_paid',
    paid_amount: '',
    general_observations: ''
  });

  useEffect(() => {
    loadCustomers();
    loadProducts();
  }, []);

  // Recalcular parts_cost cuando el usuario agrega/quita repuestos
  useEffect(() => {
    if (!partsModified) return;
    const total = selectedParts.reduce((sum, p) => sum + p.subtotal, 0);
    setFormData(prev => ({ ...prev, parts_cost: total.toFixed(2) }));
  }, [selectedParts, partsModified]);

  const loadCustomers = async () => {
    try {
      setLoadingCustomers(true);
      const data = await customersService.getAll();
      const customersArray = data.results || data;
      setCustomers(Array.isArray(customersArray) ? customersArray : []);
    } catch (err) {
      console.error('Error al cargar clientes:', err);
    } finally {
      setLoadingCustomers(false);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await inventoryService.getProducts({ page_size: 200 });
      const arr = data.results || data;
      setProducts(Array.isArray(arr) ? arr.filter(p => p.is_active) : []);
    } catch (err) {
      console.error('Error al cargar productos:', err);
    }
  };

  const handleAddPart = () => {
    if (!partSelector.productId) return;
    const product = products.find(p => p.id === parseInt(partSelector.productId));
    if (!product) return;
    const qty = parseInt(partSelector.quantity) || 1;
    // Si ya está, sumar cantidad
    const existing = selectedParts.find(p => p.id === product.id);
    setPartsModified(true);
    if (existing) {
      setSelectedParts(prev => prev.map(p =>
        p.id === product.id
          ? { ...p, quantity: p.quantity + qty, subtotal: parseFloat(p.unit_price) * (p.quantity + qty) }
          : p
      ));
    } else {
      setSelectedParts(prev => [...prev, {
        id: product.id,
        name: product.name,
        unit_price: parseFloat(product.unit_price),
        quantity: qty,
        subtotal: parseFloat(product.unit_price) * qty
      }]);
    }
    setPartSelector({ productId: '', quantity: 1 });
    setPartSearch('');
    setPartDropdownOpen(false);
  };

  const handleRemovePart = (productId) => {
    setPartsModified(true);
    setSelectedParts(prev => prev.filter(p => p.id !== productId));
  };

  const handlePartQuantityChange = (productId, newQty) => {
    setPartsModified(true);
    const qty = parseInt(newQty) || 1;
    setSelectedParts(prev => prev.map(p =>
      p.id === productId
        ? { ...p, quantity: qty, subtotal: parseFloat(p.unit_price) * qty }
        : p
    ));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Preparar datos para enviar
      const dataToSend = { ...formData };
      
      // Si no es cuenta corriente, no enviar paid_amount
      if (formData.payment_method !== 'account') {
        delete dataToSend.paid_amount;
      } else {
        // Si es cuenta corriente y no hay paid_amount, poner 0
        if (!dataToSend.paid_amount) {
          dataToSend.paid_amount = 0;
        }
      }

      // Incluir repuestos para que el backend descuente el stock
      dataToSend.parts = selectedParts.map(p => ({
        product_id: p.id,
        quantity: p.quantity,
      }));

      await ordersService.create(dataToSend);
      navigate('/orders');
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.[0] || 'Error al crear la orden');
      console.error('Error al crear orden:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/orders')}
            className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a Órdenes
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Nueva Orden de Reparación</h1>
          <p className="text-gray-600 mt-2">Complete los datos del servicio técnico</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
            <div className="flex items-center">
              <svg className="h-6 w-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sección: Cliente */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Información del Cliente</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="customer" className="block text-sm font-medium text-gray-700 mb-2">
                  Cliente <span className="text-red-500">*</span>
                </label>
                {loadingCustomers ? (
                  <div className="text-sm text-gray-500">Cargando clientes...</div>
                ) : (
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={customerSearch}
                        onChange={e => {
                          const val = e.target.value;
                          setCustomerSearch(val);
                          setCustomerDropdownOpen(val.length >= 2);
                          if (!val) {
                            setCustomerSearch('');
                            setFormData(prev => ({ ...prev, customer: '' }));
                          }
                        }}
                        onFocus={() => { if (customerSearch.length >= 2) setCustomerDropdownOpen(true); }}
                        onBlur={() => setTimeout(() => setCustomerDropdownOpen(false), 150)}
                        placeholder="Buscar por nombre o DNI..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        disabled={loading}
                        autoComplete="off"
                      />
                      {/* Campo oculto para validación required */}
                      <input type="hidden" name="customer" value={formData.customer} required />
                      {customerDropdownOpen && (() => {
                        const q = customerSearch.toLowerCase();
                        const filtered = customers.filter(c =>
                          `${c.first_name} ${c.last_name}`.toLowerCase().includes(q) ||
                          c.dni.includes(q)
                        );
                        return filtered.length > 0 ? (
                          <ul className="absolute z-50 left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto mt-1">
                            {filtered.map(c => (
                              <li
                                key={c.id}
                                onMouseDown={() => {
                                  setFormData(prev => ({ ...prev, customer: String(c.id) }));
                                  setCustomerSearch(`${c.first_name} ${c.last_name} - ${c.dni}`);
                                  setCustomerDropdownOpen(false);
                                }}
                                className="px-4 py-2 text-sm cursor-pointer hover:bg-primary hover:text-white transition-colors"
                              >
                                <span className="font-medium">{c.first_name} {c.last_name}</span>
                                <span className="ml-2 text-xs opacity-75">DNI: {c.dni}</span>
                                {c.phone && <span className="ml-2 text-xs opacity-75">· {c.phone}</span>}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="absolute z-50 left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg mt-1 px-4 py-2 text-sm text-gray-500">
                            Sin resultados
                          </div>
                        );
                      })()}
                    </div>
                    <button
                      type="button"
                      onClick={() => window.open('/customers/new', '_blank')}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                      title="Crear nuevo cliente"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sección: Equipo */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Información del Equipo</h2>
            
            <div className="space-y-4">
              {/* Tipo de dispositivo */}
              <div>
                <label htmlFor="device_type" className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Dispositivo <span className="text-red-500">*</span>
                </label>
                <select
                  id="device_type"
                  name="device_type"
                  required
                  value={formData.device_type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={loading}
                >
                  <option value="phone">Celular</option>
                  <option value="tablet">Tablet</option>
                  <option value="laptop">Notebook</option>
                  <option value="desktop">PC de Escritorio</option>
                  <option value="other">Otro</option>
                </select>
              </div>

              {/* Marca y Modelo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="device_brand" className="block text-sm font-medium text-gray-700 mb-2">
                    Marca <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="device_brand"
                    name="device_brand"
                    required
                    value={formData.device_brand}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Ej: Samsung, Apple, Lenovo"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="device_model" className="block text-sm font-medium text-gray-700 mb-2">
                    Modelo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="device_model"
                    name="device_model"
                    required
                    value={formData.device_model}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Ej: Galaxy S21, iPhone 13, ThinkPad"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Color y Serial */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="device_color" className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
                  <input
                    type="text"
                    id="device_color"
                    name="device_color"
                    value={formData.device_color}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Opcional"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="device_serial" className="block text-sm font-medium text-gray-700 mb-2">
                    Serial / IMEI
                  </label>
                  <input
                    type="text"
                    id="device_serial"
                    name="device_serial"
                    value={formData.device_serial}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Opcional"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Datos de seguridad */}
              <div>
                <label htmlFor="security_data" className="block text-sm font-medium text-gray-700 mb-2">
                  Datos de Seguridad (Clave, Patrón, PIN)
                </label>
                <input
                  type="text"
                  id="security_data"
                  name="security_data"
                  value={formData.security_data}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Información confidencial de acceso al equipo"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Sección: Problema y Diagnóstico */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Problema y Diagnóstico</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="problem_description" className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción del Problema <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="problem_description"
                  name="problem_description"
                  required
                  rows={4}
                  value={formData.problem_description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Describa el problema reportado por el cliente..."
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700 mb-2">
                  Diagnóstico Inicial
                </label>
                <textarea
                  id="diagnosis"
                  name="diagnosis"
                  rows={3}
                  value={formData.diagnosis}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Diagnóstico técnico (opcional)..."
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Sección: Costos */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Costos y Pago</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="estimated_cost" className="block text-sm font-medium text-gray-700 mb-2">
                    Precio Total al Cliente
                  </label>
                  <input
                    type="number"
                    id="estimated_cost"
                    name="estimated_cost"
                    step="0.01"
                    value={formData.estimated_cost}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="0.00"
                    disabled={loading}
                  />
                </div>

              </div>

              {/* Selector de repuestos */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Repuestos utilizados</h3>

                {/* Agregar repuesto */}
                <div className="flex gap-2 mb-3">
                  <div className="flex-1 relative" ref={partSearchRef}>
                    <input
                      type="text"
                      value={partSearch}
                      onChange={e => {
                        const val = e.target.value;
                        setPartSearch(val);
                        setPartDropdownOpen(val.length >= 2);
                        if (!val) setPartSelector(prev => ({ ...prev, productId: '' }));
                      }}
                      onFocus={() => { if (partSearch.length >= 2) setPartDropdownOpen(true); }}
                      onBlur={() => setTimeout(() => setPartDropdownOpen(false), 150)}
                      placeholder="Buscar repuesto..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                      disabled={loading}
                      autoComplete="off"
                    />
                    {partDropdownOpen && (() => {
                      const filtered = products.filter(p =>
                        p.name.toLowerCase().includes(partSearch.toLowerCase())
                      );
                      return filtered.length > 0 ? (
                        <ul className="absolute z-50 left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg max-h-52 overflow-y-auto mt-1">
                          {filtered.map(p => (
                            <li
                              key={p.id}
                              onMouseDown={() => {
                                setPartSelector(prev => ({ ...prev, productId: String(p.id) }));
                                setPartSearch(`${p.name} · $${parseFloat(p.unit_price).toLocaleString('es-AR')} · Stock: ${p.quantity}`);
                                setPartDropdownOpen(false);
                              }}
                              className="px-3 py-2 text-sm cursor-pointer hover:bg-primary hover:text-white transition-colors"
                            >
                              <span className="font-medium">{p.name}</span>
                              <span className="ml-2 text-xs opacity-75">${parseFloat(p.unit_price).toLocaleString('es-AR')} · Stock: {p.quantity}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="absolute z-50 left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg mt-1 px-3 py-2 text-sm text-gray-500">
                          Sin resultados
                        </div>
                      );
                    })()}
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={partSelector.quantity}
                    onChange={e => setPartSelector(prev => ({ ...prev, quantity: e.target.value }))}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary"
                    placeholder="Cant."
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={handleAddPart}
                    disabled={!partSelector.productId || loading}
                    className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-40 transition-colors"
                  >
                    + Agregar
                  </button>
                </div>

                {/* Lista de repuestos seleccionados */}
                {selectedParts.length > 0 && (
                  <div className="border border-gray-100 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left px-3 py-2 text-gray-600 font-medium">Repuesto</th>
                          <th className="text-center px-3 py-2 text-gray-600 font-medium">Cant.</th>
                          <th className="text-right px-3 py-2 text-gray-600 font-medium">P. Unit.</th>
                          <th className="text-right px-3 py-2 text-gray-600 font-medium">Subtotal</th>
                          <th className="px-2 py-2"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedParts.map(part => (
                          <tr key={part.id} className="border-t border-gray-100">
                            <td className="px-3 py-2 text-gray-800">{part.name}</td>
                            <td className="px-3 py-2 text-center">
                              <input
                                type="number"
                                min="1"
                                value={part.quantity}
                                onChange={e => handlePartQuantityChange(part.id, e.target.value)}
                                className="w-16 px-2 py-1 border border-gray-200 rounded text-center text-sm"
                                disabled={loading}
                              />
                            </td>
                            <td className="px-3 py-2 text-right text-gray-600">${part.unit_price.toLocaleString('es-AR')}</td>
                            <td className="px-3 py-2 text-right font-semibold text-gray-800">${part.subtotal.toLocaleString('es-AR')}</td>
                            <td className="px-2 py-2">
                              <button type="button" onClick={() => handleRemovePart(part.id)} className="text-red-400 hover:text-red-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50 border-t border-gray-200">
                        <tr>
                          <td colSpan={3} className="px-3 py-2 text-sm font-semibold text-gray-700">Total repuestos</td>
                          <td className="px-3 py-2 text-right font-bold text-gray-900">${parseFloat(formData.parts_cost).toLocaleString('es-AR')}</td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}

                {selectedParts.length === 0 && (
                  <p className="text-sm text-gray-400 italic">Sin repuestos agregados</p>
                )}
              </div>

              {/* Resumen de ganancia */}
              {(formData.estimated_cost || formData.parts_cost) && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-green-800 mb-1">Desglose estimado:</p>
                  <div className="flex justify-between text-sm text-green-700">
                    <span>Precio total:</span>
                    <span className="font-medium">${parseFloat(formData.estimated_cost || 0).toLocaleString('es-AR')}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-700">
                    <span>Costo repuestos:</span>
                    <span className="font-medium">- ${parseFloat(formData.parts_cost || 0).toLocaleString('es-AR')}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-green-800 border-t border-green-300 pt-1 mt-1">
                    <span>Ganancia mano de obra:</span>
                    <span>${(parseFloat(formData.estimated_cost || 0) - parseFloat(formData.parts_cost || 0)).toLocaleString('es-AR')}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="deposit_amount" className="block text-sm font-medium text-gray-700 mb-2">
                    Adelanto / Seña
                  </label>
                  <input
                    type="number"
                    id="deposit_amount"
                    name="deposit_amount"
                    step="0.01"
                    value={formData.deposit_amount}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="0.00"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700 mb-2">
                  Método de Pago
                </label>
                <select
                  id="payment_method"
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={loading}
                >
                  <option value="not_paid">Sin Abonar</option>
                  <option value="cash">Efectivo</option>
                  <option value="transfer">Transferencia</option>
                  <option value="account">Cuenta Corriente</option>
                </select>
                
                {/* Campo para pago parcial cuando es cuenta corriente */}
                {formData.payment_method === 'account' && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monto a pagar ahora (opcional)
                    </label>
                    <input
                      type="number"
                      name="paid_amount"
                      value={formData.paid_amount}
                      onChange={handleChange}
                      placeholder="0.00"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      min="0"
                      step="0.01"
                      disabled={loading}
                    />
                    {formData.estimated_cost && (
                      <p className="text-sm text-gray-500 mt-2">
                        Saldo pendiente: ${(parseFloat(formData.estimated_cost || 0) - (parseFloat(formData.paid_amount) || 0)).toLocaleString('es-AR')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sección: Observaciones */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Observaciones Generales</h2>
            
            <div>
              <textarea
                id="general_observations"
                name="general_observations"
                rows={3}
                value={formData.general_observations}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Observaciones adicionales (opcional)..."
                disabled={loading}
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/orders')}
              disabled={loading}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creando Orden...
                </>
              ) : (
                'Crear Orden de Reparación'
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default NewOrder;
