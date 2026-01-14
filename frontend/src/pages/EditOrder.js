import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { customersService, ordersService } from '../services/api';

const EditOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    repair_notes: '',
    estimated_cost: '',
    final_cost: '',
    deposit_amount: '0',
    payment_method: 'not_paid',
    general_observations: '',
    status: 'received'
  });

  useEffect(() => {
    loadCustomers();
    loadOrder();
  }, [id]);

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

  const loadOrder = async () => {
    try {
      setLoading(true);
      const data = await ordersService.getById(id);
      setFormData({
        customer: data.customer,
        device_type: data.device_type || 'phone',
        device_brand: data.device_brand || '',
        device_model: data.device_model || '',
        device_color: data.device_color || '',
        device_serial: data.device_serial || '',
        security_data: data.security_data || '',
        problem_description: data.problem_description || '',
        diagnosis: data.diagnosis || '',
        repair_notes: data.repair_notes || '',
        estimated_cost: data.estimated_cost || '',
        final_cost: data.final_cost || '',
        deposit_amount: data.deposit_amount || '0',
        payment_method: data.payment_method || 'not_paid',
        general_observations: data.general_observations || '',
        status: data.status || 'received'
      });
      setError('');
    } catch (err) {
      setError('Error al cargar la orden');
      console.error('Error al cargar orden:', err);
    } finally {
      setLoading(false);
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
    setSaving(true);

    try {
      await ordersService.update(id, formData);
      navigate(`/orders/${id}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al actualizar la orden');
      console.error('Error al actualizar orden:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/orders/${id}`)}
            className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al Detalle
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Editar Orden de Reparación</h1>
          <p className="text-gray-600 mt-2">Modifica los datos del servicio técnico</p>
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
                  <select
                    id="customer"
                    name="customer"
                    required
                    value={formData.customer}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    disabled={saving}
                  >
                    <option value="">Seleccionar cliente</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id}>
                        {customer.first_name} {customer.last_name} - {customer.dni}
                      </option>
                    ))}
                  </select>
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
                  disabled={saving}
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
                    disabled={saving}
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
                    disabled={saving}
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
                    disabled={saving}
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
                    disabled={saving}
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
                  disabled={saving}
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
                  disabled={saving}
                />
              </div>

              <div>
                <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700 mb-2">
                  Diagnóstico
                </label>
                <textarea
                  id="diagnosis"
                  name="diagnosis"
                  rows={3}
                  value={formData.diagnosis}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Diagnóstico técnico (opcional)..."
                  disabled={saving}
                />
              </div>

              <div>
                <label htmlFor="repair_notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Notas de Reparación
                </label>
                <textarea
                  id="repair_notes"
                  name="repair_notes"
                  rows={3}
                  value={formData.repair_notes}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Notas sobre el proceso de reparación..."
                  disabled={saving}
                />
              </div>
            </div>
          </div>

          {/* Sección: Estado */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Estado de la Orden</h2>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Estado <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                name="status"
                required
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={saving}
              >
                <option value="received">Recibido</option>
                <option value="in_service">En Servicio</option>
                <option value="repaired">Reparado</option>
                <option value="not_repaired">No Reparado</option>
                <option value="not_solved">No Solucionado</option>
                <option value="ready">Listo para Entrega</option>
                <option value="delivered">Entregado</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
          </div>

          {/* Sección: Costos */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Costos y Pago</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="estimated_cost" className="block text-sm font-medium text-gray-700 mb-2">
                    Costo Estimado
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-gray-500">$</span>
                    <input
                      type="number"
                      id="estimated_cost"
                      name="estimated_cost"
                      step="0.01"
                      value={formData.estimated_cost}
                      onChange={handleChange}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="0.00"
                      disabled={saving}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="final_cost" className="block text-sm font-medium text-gray-700 mb-2">
                    Costo Final
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-gray-500">$</span>
                    <input
                      type="number"
                      id="final_cost"
                      name="final_cost"
                      step="0.01"
                      value={formData.final_cost}
                      onChange={handleChange}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="0.00"
                      disabled={saving}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="deposit_amount" className="block text-sm font-medium text-gray-700 mb-2">
                    Adelanto / Seña
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-gray-500">$</span>
                    <input
                      type="number"
                      id="deposit_amount"
                      name="deposit_amount"
                      step="0.01"
                      value={formData.deposit_amount}
                      onChange={handleChange}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="0.00"
                      disabled={saving}
                    />
                  </div>
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
                  disabled={saving}
                >
                  <option value="not_paid">Sin Abonar</option>
                  <option value="cash">Efectivo</option>
                  <option value="transfer">Transferencia</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sección: Observaciones */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Observaciones Generales</h2>
            
            <div>
              <textarea
                id="general_observations"
                name="general_observations"
                rows={3}
                value={formData.general_observations}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Observaciones adicionales (opcional)..."
                disabled={saving}
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(`/orders/${id}`)}
              disabled={saving}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </>
              ) : (
                'Actualizar Orden'
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditOrder;
