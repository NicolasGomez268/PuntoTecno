import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { salesService } from '../services/api';

/**
 * Página de listado de ventas
 */
const Sales = () => {
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPayment, setFilterPayment] = useState('');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [salesData, dashboardData] = await Promise.all([
        salesService.getSales(),
        salesService.getDashboard()
      ]);
      // Manejar respuesta paginada o array directo
      const salesArray = Array.isArray(salesData) ? salesData : (salesData?.results || []);
      setSales(salesArray);
      setStats(dashboardData);
    } catch (error) {
      console.error('Error al cargar ventas:', error);
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredSales = Array.isArray(sales) ? sales.filter(sale => {
    const matchesSearch = sale.sale_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.customer_display.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPayment = !filterPayment || sale.payment_method === filterPayment;
    return matchesSearch && matchesPayment;
  }) : [];

  const paymentMethods = {
    'cash': 'Efectivo',
    'card': 'Tarjeta',
    'transfer': 'Transferencia',
    'multiple': 'Múltiple'
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando ventas...</p>
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Ventas</h1>
              <p className="text-gray-600 mt-2">Gestión de ventas directas</p>
            </div>
            <button
              onClick={() => navigate('/sales/new')}
              className="btn-primary"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nueva Venta
            </button>
          </div>
        </div>

        {/* Estadísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Ventas Hoy</p>
                  <p className="text-3xl font-bold mt-2">{stats.sales_today.count}</p>
                  <p className="text-blue-100 text-sm mt-1">
                    ${stats.sales_today.total.toLocaleString('es-AR')}
                  </p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-full p-3">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Ventas del Mes</p>
                  <p className="text-3xl font-bold mt-2">{stats.sales_month.count}</p>
                  <p className="text-green-100 text-sm mt-1">
                    ${stats.sales_month.total.toLocaleString('es-AR')}
                  </p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-full p-3">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Promedio</p>
                  <p className="text-3xl font-bold mt-2">
                    ${stats.sales_today.count > 0 
                      ? (stats.sales_today.total / stats.sales_today.count).toFixed(0).toLocaleString('es-AR')
                      : '0'
                    }
                  </p>
                  <p className="text-purple-100 text-sm mt-1">Por venta hoy</p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-full p-3">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Más Vendido</p>
                  <p className="text-xl font-bold mt-2 truncate">
                    {stats.top_products[0]?.product__name || 'N/A'}
                  </p>
                  <p className="text-orange-100 text-sm mt-1">
                    {stats.top_products[0]?.quantity || 0} unidades
                  </p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-full p-3">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar
              </label>
              <input
                type="text"
                placeholder="Buscar por número de ticket o cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Método de Pago
              </label>
              <select
                value={filterPayment}
                onChange={(e) => setFilterPayment(e.target.value)}
                className="input-field"
              >
                <option value="">Todos</option>
                <option value="cash">Efectivo</option>
                <option value="card">Tarjeta</option>
                <option value="transfer">Transferencia</option>
                <option value="multiple">Múltiple</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-700 text-sm">Ticket</th>
                  <th className="text-left p-4 font-semibold text-gray-700 text-sm">Fecha</th>
                  <th className="text-left p-4 font-semibold text-gray-700 text-sm">Cliente</th>
                  <th className="text-left p-4 font-semibold text-gray-700 text-sm">Items</th>
                  <th className="text-left p-4 font-semibold text-gray-700 text-sm">Total</th>
                  <th className="text-left p-4 font-semibold text-gray-700 text-sm">Pago</th>
                  <th className="text-left p-4 font-semibold text-gray-700 text-sm">Vendedor</th>
                  <th className="text-left p-4 font-semibold text-gray-700 text-sm">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-gray-500">
                      No se encontraron ventas
                    </td>
                  </tr>
                ) : (
                  filteredSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <span className="font-medium text-gray-900">{sale.sale_number}</span>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="text-sm text-gray-900">
                            {new Date(sale.date).toLocaleDateString('es-AR')}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(sale.date).toLocaleTimeString('es-AR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-gray-900">{sale.customer_display}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-gray-900">{sale.items_count}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-medium text-gray-900">
                          ${sale.total.toLocaleString('es-AR')}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          sale.payment_method === 'cash' ? 'bg-green-100 text-green-800' :
                          sale.payment_method === 'card' ? 'bg-blue-100 text-blue-800' :
                          sale.payment_method === 'transfer' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {paymentMethods[sale.payment_method]}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-gray-600">{sale.employee_name}</span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => navigate(`/sales/${sale.id}`)}
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                          title="Ver detalles"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sales;
