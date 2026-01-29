import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import OrderTicket from '../components/OrderTicket';
import { ordersService } from '../services/api';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTicket, setShowTicket] = useState(false);
  const ticketRef = useRef();
  const [error, setError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const STATUS_LABELS = {
    received: 'Recibido',
    in_service: 'En Servicio',
    repaired: 'Reparado',
    not_repaired: 'No Reparado',
    not_solved: 'No Solucionado',
    ready: 'Listo para Entrega',
    delivered: 'Entregado',
    cancelled: 'Cancelado'
  };

  const STATUS_COLORS = {
    received: 'bg-blue-100 text-blue-800 border-blue-200',
    in_service: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    repaired: 'bg-green-100 text-green-800 border-green-200',
    not_repaired: 'bg-red-100 text-red-800 border-red-200',
    not_solved: 'bg-red-100 text-red-800 border-red-200',
    ready: 'bg-purple-100 text-purple-800 border-purple-200',
    delivered: 'bg-gray-100 text-gray-800 border-gray-200',
    cancelled: 'bg-gray-100 text-gray-800 border-gray-200'
  };

  const DEVICE_TYPES = {
    phone: 'Celular',
    tablet: 'Tablet',
    laptop: 'Notebook',
    desktop: 'PC de Escritorio',
    other: 'Otro'
  };

  const PAYMENT_METHODS = {
    not_paid: 'Sin Abonar',
    cash: 'Efectivo',
    transfer: 'Transferencia'
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const data = await ordersService.getById(id);
      setOrder(data);
      setError('');
    } catch (err) {
      setError('Error al cargar la orden');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!order) return;
    
    setUpdatingStatus(true);
    try {
      await ordersService.updateStatus(id, newStatus);
      await loadOrder(); // Recargar para ver el cambio
    } catch (err) {
      setError('Error al actualizar el estado');
      console.error('Error:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
            <p className="text-red-800 font-medium">{error || 'Orden no encontrada'}</p>
          </div>
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
            onClick={() => navigate('/orders')}
            className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a Órdenes
          </button>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Orden {order.order_number}</h1>
              <p className="text-gray-600 mt-1">
                Creada el {new Date(order.received_date).toLocaleDateString('es-AR', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            
            <div className={`px-6 py-3 rounded-lg border-2 font-semibold text-center ${STATUS_COLORS[order.status]}`}>
              {STATUS_LABELS[order.status]}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cliente */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Cliente
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Nombre</p>
                  <p className="font-medium text-gray-900">{order.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Teléfono</p>
                  <p className="font-medium text-gray-900">{order.customer_phone}</p>
                </div>
                {order.customer_email && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Email</p>
                    <p className="font-medium text-gray-900">{order.customer_email}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Equipo */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Información del Equipo
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Tipo</p>
                  <p className="font-medium text-gray-900">{DEVICE_TYPES[order.device_type]}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Marca</p>
                  <p className="font-medium text-gray-900">{order.device_brand}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Modelo</p>
                  <p className="font-medium text-gray-900">{order.device_model}</p>
                </div>
                {order.device_color && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Color</p>
                    <p className="font-medium text-gray-900">{order.device_color}</p>
                  </div>
                )}
                {order.device_serial && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500 mb-1">Serial / IMEI</p>
                    <p className="font-medium text-gray-900">{order.device_serial}</p>
                  </div>
                )}
                {order.security_data && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500 mb-1">Datos de Seguridad</p>
                    <p className="font-medium text-gray-900 bg-yellow-50 px-3 py-2 rounded">
                      {order.security_data}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Problema y Diagnóstico */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Problema y Diagnóstico
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Problema Reportado</p>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded">{order.problem_description}</p>
                </div>
                {order.diagnosis && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Diagnóstico</p>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded">{order.diagnosis}</p>
                  </div>
                )}
                {order.repair_notes && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Notas de Reparación</p>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded">{order.repair_notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Observaciones */}
            {order.general_observations && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Observaciones Generales</h2>
                <p className="text-gray-900 bg-gray-50 p-3 rounded">{order.general_observations}</p>
              </div>
            )}
          </div>

          {/* Columna lateral */}
          <div className="space-y-6">
            {/* Cambiar Estado */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Cambiar Estado</h2>
              <div className="space-y-2">
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => handleStatusChange(key)}
                    disabled={updatingStatus || order.status === key}
                    className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      order.status === key
                        ? 'bg-primary text-white cursor-default'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } disabled:opacity-50`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Costos */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Costos
              </h2>
              <div className="space-y-3">
                {order.estimated_cost && (
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-sm text-gray-600">Costo Estimado</span>
                    <span className="font-semibold text-gray-900">${parseFloat(order.estimated_cost).toFixed(2)}</span>
                  </div>
                )}
                {order.final_cost && (
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-sm text-gray-600">Costo Final</span>
                    <span className="font-semibold text-gray-900">${parseFloat(order.final_cost).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-sm text-gray-600">Adelanto/Seña</span>
                  <span className="font-semibold text-gray-900">${parseFloat(order.deposit_amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Método de Pago</span>
                  <span className="font-medium text-gray-900">{PAYMENT_METHODS[order.payment_method]}</span>
                </div>
              </div>
            </div>

            {/* Información Adicional */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Información Adicional</h2>
              <div className="space-y-3 text-sm">
                {order.assigned_to_name && (
                  <div>
                    <p className="text-gray-500">Asignado a</p>
                    <p className="font-medium text-gray-900">{order.assigned_to_name}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-500">Creado por</p>
                  <p className="font-medium text-gray-900">{order.created_by_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Última actualización</p>
                  <p className="font-medium text-gray-900">
                    {new Date(order.updated_at).toLocaleDateString('es-AR')}
                  </p>
                </div>
              </div>
            </div>

            {/* Botones de Acción */}
            <button
              onClick={() => setShowTicket(!showTicket)}
              className="w-full bg-primary hover:bg-secondary text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mb-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              {showTicket ? 'Ocultar Ticket' : 'Ver Ticket'}
            </button>

            <button
              onClick={() => window.print()}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mb-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Imprimir Ticket
            </button>

            <button
              onClick={() => navigate(`/orders/${id}/edit`)}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar Orden
            </button>
          </div>
        </div>

        {/* Área de Ticket para Imprimir */}
        {showTicket && (
          <div className="mt-8 ticket-print-area" ref={ticketRef}>
            <div className="print:hidden mb-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Vista Previa del Ticket</h2>
              <p className="text-gray-600 mb-2">Este es el ticket que se imprimirá. Se generarán 2 copias: una para el técnico y otra para el cliente.</p>
            </div>
            
            {/* Copia para Técnico */}
            <OrderTicket order={order} duplicate="TÉCNICO" />
            
            {/* Copia para Cliente */}
            <OrderTicket order={order} duplicate="CLIENTE" />
          </div>
        )}
      </div>
    </>
  );
};

export default OrderDetail;
