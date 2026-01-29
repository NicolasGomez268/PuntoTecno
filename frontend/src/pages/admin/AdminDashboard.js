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

        {/* Tarjetas de estadísticas en una fila horizontal */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Listas para Entrega */}
          <div className="bg-white border-2 border-blue-200 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 rounded-lg p-2.5 flex-shrink-0">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-600 font-medium">Listas</p>
                <p className="text-2xl font-bold text-primary">{dashboardData?.ready_count || 0}</p>
              </div>
            </div>
          </div>

          {/* Entregadas */}
          <div className="bg-gradient-to-br from-sky-500 to-sky-600 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <div className="bg-white bg-opacity-20 rounded-lg p-2.5 flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1 min-w-0 text-white">
                <p className="text-xs text-sky-100 font-medium">Entregadas</p>
                <p className="text-2xl font-bold">{dashboardData?.delivered_count || 0}</p>
              </div>
            </div>
          </div>

          {/* Órdenes del mes */}
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <div className="bg-white bg-opacity-20 rounded-lg p-2.5 flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0 text-white">
                <p className="text-xs text-cyan-100 font-medium">Órdenes del Mes</p>
                <p className="text-2xl font-bold">{dashboardData?.orders_this_month || 0}</p>
              </div>
            </div>
          </div>

          {/* Ingresos del mes */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <div className="bg-white bg-opacity-20 rounded-lg p-2.5 flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0 text-white">
                <p className="text-xs text-green-100 font-medium">Ingresos</p>
                <p className="text-xl font-bold truncate">
                  ${(dashboardData?.revenue_this_month || 0).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>
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

          {/* Accesos rápidos - Botones principales */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Accesos Rápidos</h2>
            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => navigate('/customers/new')}
                className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-5 rounded-lg shadow-md flex items-center justify-between group transition-all"
              >
                <div className="text-left">
                  <p className="font-semibold text-lg">Nuevo Cliente</p>
                  <p className="text-sm text-blue-100 mt-1">Registrar cliente nuevo</p>
                </div>
                <svg className="w-10 h-10 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </button>

              <button
                onClick={() => navigate('/orders/new')}
                className="bg-gradient-to-br from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white p-5 rounded-lg shadow-md flex items-center justify-between group transition-all"
              >
                <div className="text-left">
                  <p className="font-semibold text-lg">Nueva Orden</p>
                  <p className="text-sm text-cyan-100 mt-1">Registrar servicio técnico</p>
                </div>
                <svg className="w-10 h-10 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>

              <button
                onClick={() => navigate('/inventory')}
                className="bg-gradient-to-br from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white p-5 rounded-lg shadow-md flex items-center justify-between group transition-all"
              >
                <div className="text-left">
                  <p className="font-semibold text-lg">Inventario</p>
                  <p className="text-sm text-sky-100 mt-1">Gestionar productos</p>
                </div>
                <svg className="w-10 h-10 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;

