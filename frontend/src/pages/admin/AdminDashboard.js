import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { ordersService } from '../../services/api';

/**
 * Dashboard para administradores
 * Muestra estadísticas generales del sistema
 */
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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
    received: 'bg-blue-100 text-blue-800',
    in_service: 'bg-yellow-100 text-yellow-800',
    repaired: 'bg-green-100 text-green-800',
    not_repaired: 'bg-red-100 text-red-800',
    not_solved: 'bg-red-100 text-red-800',
    ready: 'bg-purple-100 text-purple-800',
    delivered: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-gray-100 text-gray-800'
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboard, orders] = await Promise.all([
        ordersService.getDashboard(),
        ordersService.getAll({ ordering: '-received_date' })
      ]);

      setDashboardData(dashboard);
      const ordersArray = orders.results || orders;
      setRecentOrders(Array.isArray(ordersArray) ? ordersArray.slice(0, 5) : []);
    } catch (error) {
      console.error('Error al cargar dashboard:', error);
    } finally {
      setLoading(false);
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
          <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
          <p className="text-gray-600 mt-2">Resumen general del sistema</p>
        </div>

        {/* Tarjetas de estadísticas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total de Órdenes */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Órdenes</p>
                <p className="text-3xl font-bold text-gray-900">
                  {dashboardData?.total_orders || 0}
                </p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <Link to="/orders" className="text-primary text-sm font-medium mt-4 inline-block hover:text-primary/80">
              Ver todas →
            </Link>
          </div>

          {/* Órdenes en Servicio */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">En Servicio</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {dashboardData?.in_service_count || 0}
                </p>
              </div>
              <div className="bg-yellow-100 rounded-full p-3">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">Órdenes activas en reparación</p>
          </div>

          {/* Listas para Entrega */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Listas</p>
                <p className="text-3xl font-bold text-purple-600">
                  {dashboardData?.ready_count || 0}
                </p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">Esperando ser retiradas</p>
          </div>

          {/* Entregadas */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Entregadas</p>
                <p className="text-3xl font-bold text-green-600">
                  {dashboardData?.delivered_count || 0}
                </p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">Completadas exitosamente</p>
          </div>
        </div>

        {/* Métricas adicionales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Órdenes del mes */}
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-100 text-sm font-medium">Órdenes del Mes</p>
                <p className="text-3xl font-bold mt-2">{dashboardData?.orders_this_month || 0}</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <p className="text-cyan-100 text-xs mt-4">Nuevas este mes</p>
          </div>

          {/* Ingresos del mes */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Ingresos del Mes</p>
                <p className="text-3xl font-bold mt-2">
                  ${(dashboardData?.revenue_this_month || 0).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-green-100 text-xs mt-4">Órdenes entregadas</p>
          </div>

          {/* Pendientes */}
          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Pendientes</p>
                <p className="text-3xl font-bold mt-2">{dashboardData?.pending_orders || 0}</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-orange-100 text-xs mt-4">Sin entregar</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Órdenes Recientes */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Órdenes Recientes</h2>
                <Link to="/orders" className="text-primary text-sm font-medium hover:text-primary/80">
                  Ver todas
                </Link>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {recentOrders.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No hay órdenes registradas
                </div>
              ) : (
                recentOrders.map((order) => (
                  <div 
                    key={order.id} 
                    className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-900">{order.order_number}</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${STATUS_COLORS[order.status]}`}>
                          {STATUS_LABELS[order.status]}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(order.received_date).toLocaleDateString('es-AR')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Cliente:</strong> {order.customer_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Equipo:</strong> {order.device_brand} {order.device_model}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Distribución por Estado */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Estados de Órdenes</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {dashboardData?.status_breakdown && Object.entries(dashboardData.status_breakdown).map(([status, count]) => {
                  const total = dashboardData.total_orders || 1;
                  const percentage = ((count / total) * 100).toFixed(0);
                  
                  return (
                    <div key={status}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          {STATUS_LABELS[status] || status}
                        </span>
                        <span className="text-sm text-gray-600">{count}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            status === 'received' ? 'bg-blue-500' :
                            status === 'in_service' ? 'bg-yellow-500' :
                            status === 'ready' ? 'bg-purple-500' :
                            status === 'delivered' ? 'bg-green-500' :
                            'bg-gray-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Accesos rápidos */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => navigate('/orders/new')}
            className="bg-primary hover:bg-primary/90 text-white p-6 rounded-lg shadow-sm flex items-center justify-between group transition-all"
          >
            <div>
              <p className="font-semibold text-lg">Nueva Orden</p>
              <p className="text-sm text-white/80 mt-1">Registrar servicio técnico</p>
            </div>
            <svg className="w-8 h-8 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>

          <button
            onClick={() => navigate('/customers/new')}
            className="bg-white hover:bg-gray-50 border-2 border-gray-200 p-6 rounded-lg shadow-sm flex items-center justify-between group transition-all"
          >
            <div>
              <p className="font-semibold text-lg text-gray-900">Nuevo Cliente</p>
              <p className="text-sm text-gray-600 mt-1">Registrar cliente</p>
            </div>
            <svg className="w-8 h-8 text-gray-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </button>

          <button
            onClick={() => navigate('/inventory')}
            className="bg-white hover:bg-gray-50 border-2 border-gray-200 p-6 rounded-lg shadow-sm flex items-center justify-between group transition-all"
          >
            <div>
              <p className="font-semibold text-lg text-gray-900">Inventario</p>
              <p className="text-sm text-gray-600 mt-1">Gestionar productos</p>
            </div>
            <svg className="w-8 h-8 text-gray-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;

