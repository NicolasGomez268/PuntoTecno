import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Pagination from '../components/Pagination';
import { ordersService } from '../services/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

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
    loadOrders();
  }, [currentPage]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await ordersService.getAll({ page: currentPage, page_size: 50 });
      const ordersArray = data.results || data;
      setOrders(Array.isArray(ordersArray) ? ordersArray : []);
      setError('');
      
      // Calcular total de páginas
      if (data.count) {
        setTotalPages(Math.ceil(data.count / 50));
      }
    } catch (err) {
      setError('Error al cargar las órdenes');
      console.error('Error:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = Array.isArray(orders) ? orders.filter(order => {
    const matchesSearch = 
      order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.device_model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.device_brand?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) : [];

  const getStatusCount = (status) => {
    if (status === 'all') return orders.length;
    return orders.filter(order => order.status === status).length;
  };

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Órdenes de Reparación</h1>
          <p className="text-gray-600 mt-2">Administra las órdenes de servicio técnico</p>
        </div>

        {/* Filtros y acciones */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            {/* Búsqueda */}
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Buscar por N° orden, cliente, equipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Botón nueva orden */}
            <button
              onClick={() => navigate('/orders/new')}
              className="btn-primary flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nueva Orden
            </button>
          </div>

          {/* Filtros de estado */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                statusFilter === 'all' 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todas ({getStatusCount('all')})
            </button>
            <button
              onClick={() => setStatusFilter('received')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                statusFilter === 'received' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Recibido ({getStatusCount('received')})
            </button>
            <button
              onClick={() => setStatusFilter('in_service')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                statusFilter === 'in_service' 
                  ? 'bg-yellow-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              En Servicio ({getStatusCount('in_service')})
            </button>
            <button
              onClick={() => setStatusFilter('ready')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                statusFilter === 'ready' 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Listo ({getStatusCount('ready')})
            </button>
            <button
              onClick={() => setStatusFilter('delivered')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                statusFilter === 'delivered' 
                  ? 'bg-gray-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Entregado ({getStatusCount('delivered')})
            </button>
          </div>
        </div>

        {/* Tabla de órdenes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-600">
              {error}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="mt-4 text-gray-600 font-medium">
                {searchTerm || statusFilter !== 'all' ? 'No se encontraron órdenes' : 'No hay órdenes registradas'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {searchTerm || statusFilter !== 'all' ? 'Intenta con otros filtros' : 'Crea una nueva orden para comenzar'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      N° Orden
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Equipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Problema
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/orders/${order.id}`)}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {order.order_number}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {order.customer_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {order.device_brand} {order.device_model}
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.device_type}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 max-w-xs truncate">
                          {order.problem_description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${STATUS_COLORS[order.status]}`}>
                          {STATUS_LABELS[order.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(order.received_date).toLocaleDateString('es-AR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => navigate(`/orders/${order.id}`)}
                          className="text-primary hover:text-primary/80 font-medium"
                        >
                          Ver Detalle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer con paginación */}
        {!loading && !error && filteredOrders.length > 0 && (
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default Orders;
