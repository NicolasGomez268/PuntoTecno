import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { ordersService } from '../../services/api';

/**
 * Dashboard para empleados
 * Muestra órdenes asignadas y tareas pendientes
 */
const EmployeeDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myOrders, setMyOrders] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const STATUS_LABELS = {
    received: 'Recibido',
    in_service: 'En Servicio',
    repaired: 'Reparado',
    not_repaired: 'No Reparado',
    not_solved: 'No Solucionado',
    ready: 'Listo',
    delivered: 'Entregado',
    cancelled: 'Cancelado'
  };

  const STATUS_COLORS = {
    received: 'bg-blue-100 text-blue-800',
    in_service: 'bg-yellow-100 text-yellow-800',
    repaired: 'bg-green-100 text-green-800',
    not_repaired: 'bg-red-100 text-red-800',
    not_solved: 'bg-orange-100 text-orange-800',
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
      // Cargar todas las órdenes
      const orders = await ordersService.getAll({ ordering: '-received_date' });
      const ordersArray = orders.results || orders;
      
      // Filtrar órdenes asignadas al usuario actual
      const myAssignedOrders = Array.isArray(ordersArray) 
        ? ordersArray.filter(order => order.assigned_to === user.id)
        : [];

      setMyOrders(myAssignedOrders);

      // Calcular estadísticas personales
      const myStats = {
        total: myAssignedOrders.length,
        in_service: myAssignedOrders.filter(o => o.status === 'in_service').length,
        ready: myAssignedOrders.filter(o => o.status === 'ready').length,
        completed: myAssignedOrders.filter(o => o.status === 'delivered').length
      };

      setDashboardData(myStats);
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
          <div className="spinner"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">
            Bienvenido, {user?.first_name || user?.username}
          </h1>
          <p className="text-gray-600 mt-2">Estas son tus órdenes asignadas</p>
        </div>

        {/* Estadísticas personales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Mis Órdenes</p>
                <p className="text-3xl font-bold mt-2">{dashboardData?.total || 0}</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">En Servicio</p>
                <p className="text-3xl font-bold mt-2">{dashboardData?.in_service || 0}</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Listas</p>
                <p className="text-3xl font-bold mt-2">{dashboardData?.ready || 0}</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Entregadas</p>
                <p className="text-3xl font-bold mt-2">{dashboardData?.completed || 0}</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Mis órdenes asignadas */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Mis Órdenes Asignadas</h2>
            <button 
              onClick={() => navigate('/orders')} 
              className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
            >
              Ver todas
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {myOrders.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-500 text-lg">No tienes órdenes asignadas</p>
              <button 
                onClick={() => navigate('/orders')}
                className="btn-primary inline-block mt-4"
              >
                Ver todas las órdenes
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left p-4 font-semibold text-gray-700 text-sm">Orden</th>
                    <th className="text-left p-4 font-semibold text-gray-700 text-sm">Cliente</th>
                    <th className="text-left p-4 font-semibold text-gray-700 text-sm">Dispositivo</th>
                    <th className="text-left p-4 font-semibold text-gray-700 text-sm">Estado</th>
                    <th className="text-left p-4 font-semibold text-gray-700 text-sm">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {myOrders.slice(0, 10).map((order) => (
                    <tr 
                      key={order.id} 
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/orders/${order.id}`)}
                    >
                      <td className="p-4">
                        <span className="font-medium text-blue-600">{order.order_number}</span>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-gray-900">{order.customer_name}</p>
                          <p className="text-sm text-gray-500">{order.customer_phone}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-gray-700">{order.device_brand} {order.device_model}</p>
                          <p className="text-sm text-gray-500">{order.device_type_display}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                          {STATUS_LABELS[order.status]}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/orders/${order.id}`);
                          }}
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
                        >
                          Ver detalles
                          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Acciones rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/orders/new">
            <div className="bg-gradient-to-r from-primary to-secondary text-white rounded-lg p-6 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
              <div className="text-4xl mb-3">➕</div>
              <h3 className="text-xl font-semibold mb-2">Nueva Orden</h3>
              <p className="text-sm opacity-90">Registrar nueva reparación</p>
            </div>
          </Link>

          <Link to="/orders">
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-6 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
              <div className="text-4xl mb-3">📋</div>
              <h3 className="text-xl font-semibold mb-2">Ver Órdenes</h3>
              <p className="text-sm opacity-90">Consultar todas las órdenes</p>
            </div>
          </Link>

          <Link to="/inventory">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-6 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
              <div className="text-4xl mb-3">📦</div>
              <h3 className="text-xl font-semibold mb-2">Inventario</h3>
              <p className="text-sm opacity-90">Consultar stock disponible</p>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
};

export default EmployeeDashboard;
