import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SaleTicket from '../components/SaleTicket';
import { salesService } from '../services/api';

/**
 * Página de detalle de venta
 */
const SaleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showTicket, setShowTicket] = useState(false);

  useEffect(() => {
    loadSale();
  }, [id]);

  const loadSale = async () => {
    try {
      const data = await salesService.getSaleById(id);
      setSale(data);
    } catch (error) {
      console.error('Error al cargar venta:', error);
      alert('Error al cargar la venta');
      navigate('/sales');
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods = {
    'cash': 'Efectivo',
    'card': 'Tarjeta',
    'transfer': 'Transferencia',
    'multiple': 'Múltiple',
    'account': 'C. Corriente'
  };
  
  const paymentStatusLabels = {
    'paid': 'Pagado',
    'partial': 'Pago Parcial',
    'pending': 'Pendiente'
  };

  const printTicket = () => {
    window.print();
  };
  
  const handleAddPayment = async (e) => {
    e.preventDefault();
    
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0) {
      alert('Ingrese un monto válido');
      return;
    }
    
    if (amount > sale.balance) {
      alert(`El monto no puede ser mayor al saldo pendiente ($${sale.balance.toLocaleString('es-AR')})`);
      return;
    }
    
    try {
      setProcessingPayment(true);
      const updatedSale = await salesService.addPayment(id, amount);
      setSale(updatedSale);
      setPaymentAmount('');
      setShowPaymentModal(false);
      
      // Mostrar notificación de éxito
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50';
      toast.innerHTML = `
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>Pago registrado exitosamente</span>
      `;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    } catch (error) {
      console.error('Error al registrar pago:', error);
      alert(error.response?.data?.error || 'Error al registrar el pago');
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando venta...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/sales')}
            className="text-primary hover:text-primary/80 font-medium mb-4 flex items-center print:hidden"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a ventas
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{sale.sale_number}</h1>
              <p className="text-gray-600 mt-2">
                {new Date(sale.date).toLocaleDateString('es-AR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <button
              onClick={printTicket}
              className="btn-secondary print:hidden"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Imprimir Ticket
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Información del cliente */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Cliente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Cliente</p>
                <p className="font-medium text-gray-900">{sale.customer_display}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Vendedor</p>
                <p className="font-medium text-gray-900">{sale.employee_name}</p>
              </div>
            </div>
          </div>

          {/* Productos */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Productos</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left p-3 text-sm font-semibold text-gray-700">Producto</th>
                    <th className="text-right p-3 text-sm font-semibold text-gray-700">Cantidad</th>
                    <th className="text-right p-3 text-sm font-semibold text-gray-700">Precio Unit.</th>
                    <th className="text-right p-3 text-sm font-semibold text-gray-700">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sale.items.map((item) => (
                    <tr key={item.id}>
                      <td className="p-3">
                        <div>
                          <p className="font-medium text-gray-900">{item.product_name}</p>
                          <p className="text-sm text-gray-500">SKU: {item.product_sku}</p>
                        </div>
                      </td>
                      <td className="p-3 text-right text-gray-900">{item.quantity}</td>
                      <td className="p-3 text-right text-gray-900">
                        ${item.unit_price.toLocaleString('es-AR')}
                      </td>
                      <td className="p-3 text-right font-medium text-gray-900">
                        ${item.subtotal.toLocaleString('es-AR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totales */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg shadow-md border-2 border-gray-200 p-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center text-gray-700 text-lg">
                <span className="font-medium">Subtotal:</span>
                <span className="font-semibold text-gray-900">${sale.subtotal.toLocaleString('es-AR')}</span>
              </div>
              {sale.discount > 0 && (
                <div className="flex justify-between items-center text-red-600 text-lg">
                  <span className="font-medium">Descuento:</span>
                  <span className="font-semibold">-${sale.discount.toLocaleString('es-AR')}</span>
                </div>
              )}
              <div className="pt-4 border-t-2 border-gray-300">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-gray-900">Total:</span>
                  <span className="text-3xl font-bold text-primary">${sale.total.toLocaleString('es-AR')}</span>
                </div>
              </div>
              <div className="pt-4 mt-2 border-t border-gray-200 bg-white rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-700 font-medium">Método de Pago:</span>
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold shadow-sm ${
                    sale.payment_method === 'cash' ? 'bg-green-100 text-green-800 border border-green-300' :
                    sale.payment_method === 'card' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                    sale.payment_method === 'transfer' ? 'bg-purple-100 text-purple-800 border border-purple-300' :
                    sale.payment_method === 'account' ? 'bg-orange-100 text-orange-800 border border-orange-300' :
                    'bg-gray-100 text-gray-800 border border-gray-300'
                  }`}>
                    {paymentMethods[sale.payment_method]}
                  </span>
                </div>
                
                {/* Mostrar información de cuenta corriente */}
                {sale.payment_method === 'account' && (
                  <div className="mt-4 pt-3 border-t border-gray-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Estado:</span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        sale.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                        sale.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {paymentStatusLabels[sale.payment_status] || sale.payment_status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Monto Pagado:</span>
                      <span className="font-semibold text-green-700">${(sale.paid_amount || 0).toLocaleString('es-AR')}</span>
                    </div>
                    {sale.balance > 0 && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 font-medium">Saldo Pendiente:</span>
                          <span className="font-bold text-red-600 text-lg">${sale.balance.toLocaleString('es-AR')}</span>
                        </div>
                        
                        {/* Botón para registrar pago */}
                        <div className="pt-3 mt-3 border-t border-gray-200">
                          <button
                            onClick={() => setShowPaymentModal(true)}
                            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-all print:hidden"
                          >
                            <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Registrar Pago
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notas */}
          {sale.notes && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Notas</h3>
              <p className="text-gray-700 whitespace-pre-line">{sale.notes}</p>
            </div>
          )}

          {/* Botones de Ticket */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => setShowTicket(!showTicket)}
              className="flex-1 bg-primary hover:bg-secondary text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              {showTicket ? 'Ocultar Ticket' : 'Ver Ticket'}
            </button>

            <button
              onClick={() => window.print()}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Imprimir Ticket
            </button>
          </div>

          {/* Área de Ticket para Imprimir */}
          {showTicket && (
            <div className="mt-8 ticket-print-area">
              <div className="print:hidden mb-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Vista Previa del Ticket</h2>
              </div>
              <SaleTicket sale={sale} />
            </div>
          )}
        </div>
        
        {/* Modal para registrar pago */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 print:hidden">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Registrar Pago</h3>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleAddPayment}>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Venta: <span className="font-semibold text-gray-900">{sale.sale_number}</span>
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    Saldo pendiente: <span className="font-bold text-red-600 text-lg">${sale.balance.toLocaleString('es-AR')}</span>
                  </p>
                  
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monto a pagar
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-xl">$</span>
                    <input
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="0.00"
                      className="flex-1 input-field text-lg"
                      min="0"
                      step="0.01"
                      max={sale.balance}
                      required
                      autoFocus
                    />
                  </div>
                  
                  {/* Botones de monto rápido */}
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentAmount((parseFloat(sale.balance) / 2).toFixed(2))}
                      className="flex-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
                    >
                      50%
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentAmount(parseFloat(sale.balance).toFixed(2))}
                      className="flex-1 px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded font-semibold"
                    >
                      Saldo Total
                    </button>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 btn-secondary"
                    disabled={processingPayment}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary"
                    disabled={processingPayment}
                  >
                    {processingPayment ? 'Procesando...' : 'Confirmar Pago'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SaleDetail;
