import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { customersService, ordersService } from '../services/api';

const NewOrder = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  
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
    deposit_amount: '0',
    payment_method: 'not_paid',
    paid_amount: '',
    general_observations: ''
  });

  useEffect(() => {
    loadCustomers();
  }, []);

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
      await ordersService.create(formData);
      navigate('/orders');
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al crear la orden');
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
                    <select
                      id="customer"
                      name="customer"
                      required
                      value={formData.customer}
                      onChange={handleChange}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      disabled={loading}
                    >
                      <option value="">Seleccionar cliente</option>
                      {customers.map(customer => (
                        <option key={customer.id} value={customer.id}>
                          {customer.first_name} {customer.last_name} - {customer.dni}
                        </option>
                      ))}
                    </select>
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
                    Costo Estimado
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
