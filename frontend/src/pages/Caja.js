import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ordersService, salesService } from '../services/api';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value || 0);
};

const pct = (part, total) => (total > 0 ? Math.round((part / total) * 100) : 0);

const PAYMENT_METHOD_LABELS = {
  cash: 'Efectivo',
  transfer: 'Transferencia',
  card: 'Tarjeta',
  account: 'Cuenta Corriente',
  not_paid: 'Sin Abonar',
  multiple: 'Multiple',
};

const ORDER_STATUS_LABELS = {
  received: 'Recibido',
  in_service: 'En Servicio',
  repaired: 'Reparado',
  not_repaired: 'No Reparado',
  not_solved: 'No Solucionado',
  ready: 'Listo para Entrega',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

const ORDER_STATUS_COLORS = {
  received: 'bg-yellow-100 text-yellow-800',
  in_service: 'bg-blue-100 text-blue-800',
  repaired: 'bg-teal-100 text-teal-800',
  not_repaired: 'bg-red-100 text-red-800',
  not_solved: 'bg-red-100 text-red-800',
  ready: 'bg-green-100 text-green-800',
  delivered: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-red-100 text-red-800',
};

const PAYMENT_STATUS_COLORS = {
  paid: 'bg-green-100 text-green-800',
  partial: 'bg-yellow-100 text-yellow-800',
  pending: 'bg-red-100 text-red-800',
};

const PAYMENT_STATUS_LABELS = {
  paid: 'Pagado',
  partial: 'Parcial',
  pending: 'Pendiente',
};

const PERIODS = [
  { key: 'today', label: 'Hoy' },
  { key: 'week', label: 'Esta semana' },
  { key: 'month', label: 'Este mes' },
  { key: 'custom', label: 'Personalizado' },
];

const getTodayStr = () => new Date().toISOString().split('T')[0];
const getMonthStartStr = () => {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().split('T')[0];
};

const Spinner = () => (
  <div className="flex justify-center items-center py-16">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
  </div>
);

const Empty = ({ message }) => (
  <div className="text-center py-12 text-gray-400">
    <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
    <p>{message}</p>
  </div>
);

const StatCard = ({ label, value, sub, color = 'blue', icon }) => {
  const colorMap = {
    green: { bg: 'bg-green-100', text: 'text-green-600', val: 'text-gray-900' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-600', val: 'text-gray-900' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-600', val: 'text-gray-900' },
    red: { bg: 'bg-red-100', text: 'text-red-600', val: 'text-red-600' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600', val: 'text-gray-900' },
  };
  const c = colorMap[color] || colorMap.blue;
  return (
    <div className={`bg-white rounded-xl shadow-sm border ${color === 'red' ? 'border-red-200' : 'border-gray-200'} p-5`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <div className={`w-10 h-10 ${c.bg} rounded-lg flex items-center justify-center`}>
          <span className={`${c.text}`}>{icon}</span>
        </div>
      </div>
      <p className={`text-2xl font-bold ${c.val}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
};

const DistBar = ({ segments }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
    <p className="text-sm font-medium text-gray-600 mb-3">Distribucion del ingreso</p>
    <div className="flex rounded-full overflow-hidden h-5">
      {segments.map((seg, i) => (
        <div
          key={i}
          className={`${seg.color} flex items-center justify-center text-white text-xs font-medium`}
          style={{ width: `${Math.max(seg.pct, 0)}%` }}
          title={`${seg.label}: ${formatCurrency(seg.value)}`}
        >
          {seg.pct > 5 ? `${seg.pct}%` : ''}
        </div>
      ))}
    </div>
    <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-500">
      {segments.map((seg, i) => (
        <span key={i} className="flex items-center gap-1">
          <span className={`w-3 h-3 rounded-full ${seg.color} inline-block`} />
          {seg.label}: {formatCurrency(seg.value)}
        </span>
      ))}
    </div>
  </div>
);

const PendingAlert = ({ count, total }) => {
  if (!count) return null;
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-right">
      <p className="text-xs text-red-500 font-medium">TOTAL ADEUDADO</p>
      <p className="text-xl font-bold text-red-600">{formatCurrency(total)}</p>
    </div>
  );
};

/* ---- ORDERS SECTION ---- */
const OrdersSection = ({ data }) => {
  const [tab, setTab] = useState('list');
  if (!data) return <Spinner />;

  const summary = data.summary || {};
  const orders = data.delivered_orders || [];
  const pending = data.pending_orders || [];
  const total = summary.total_income || 0;

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Cobrado"
          value={formatCurrency(total)}
          sub={`${summary.delivered_count || 0} ordenes entregadas`}
          color="green"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Costo Repuestos"
          value={formatCurrency(summary.total_parts_cost)}
          sub={`${pct(summary.total_parts_cost, total)}% del total`}
          color="orange"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        <StatCard
          label="Ganancia M.O."
          value={formatCurrency(summary.total_labor_profit)}
          sub={`${pct(summary.total_labor_profit, total)}% del total`}
          color="blue"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />
        <StatCard
          label="Saldo Pendiente"
          value={formatCurrency(summary.pending_balance_total)}
          sub={`${summary.pending_orders_count || 0} ordenes con deuda`}
          color="red"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {total > 0 && (
        <DistBar segments={[
          { label: 'Mano de obra', value: summary.total_labor_profit, pct: pct(summary.total_labor_profit, total), color: 'bg-blue-500' },
          { label: 'Repuestos', value: summary.total_parts_cost, pct: pct(summary.total_parts_cost, total), color: 'bg-orange-400' },
        ]} />
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 flex">
          <button
            onClick={() => setTab('list')}
            className={`px-5 py-3 text-sm font-medium transition-colors ${tab === 'list' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Entregadas ({orders.length})
          </button>
          <button
            onClick={() => setTab('pending')}
            className={`px-5 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${tab === 'pending' ? 'border-b-2 border-red-500 text-red-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Saldos pendientes
            {pending.length > 0 && (
              <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{pending.length}</span>
            )}
          </button>
        </div>

        {tab === 'list' && (
          <div className="overflow-x-auto">
            {orders.length === 0 ? (
              <Empty message="No hay ordenes entregadas en este periodo" />
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Orden</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Cliente</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Dispositivo</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Total</th>
                    <th className="text-right px-4 py-3 font-medium text-orange-600">Repuestos</th>
                    <th className="text-right px-4 py-3 font-medium text-blue-600">Ganancia M.O.</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600">Cobro</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600">Estado pago</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map(o => (
                    <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <Link to={`/orders/${o.id}`} className="font-mono text-blue-600 hover:underline font-medium">{o.order_number}</Link>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{o.customer_name}</p>
                        {o.customer_phone && <p className="text-xs text-gray-400">{o.customer_phone}</p>}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{o.device_type}{o.brand ? ` - ${o.brand}` : ''}</td>
                      <td className="px-4 py-3 text-right font-semibold">{formatCurrency(o.final_cost)}</td>
                      <td className="px-4 py-3 text-right text-orange-600">
                        {o.parts_cost > 0 ? formatCurrency(o.parts_cost) : <span className="text-gray-300">-</span>}
                      </td>
                      <td className="px-4 py-3 text-right text-blue-600 font-medium">{formatCurrency(o.labor_profit)}</td>
                      <td className="px-4 py-3 text-center text-xs text-gray-500">{PAYMENT_METHOD_LABELS[o.payment_method] || o.payment_method}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${PAYMENT_STATUS_COLORS[o.payment_status]}`}>
                          {PAYMENT_STATUS_LABELS[o.payment_status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-gray-500">{o.delivered_date || o.received_date || '-'}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-gray-700">Total ({orders.length})</td>
                    <td className="px-4 py-3 text-right font-bold">{formatCurrency(summary.total_income)}</td>
                    <td className="px-4 py-3 text-right font-bold text-orange-600">{formatCurrency(summary.total_parts_cost)}</td>
                    <td className="px-4 py-3 text-right font-bold text-blue-600">{formatCurrency(summary.total_labor_profit)}</td>
                    <td colSpan={3} />
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        )}

        {tab === 'pending' && (
          <div className="overflow-x-auto">
            {pending.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-12 h-12 mx-auto mb-3 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-green-600 font-medium">Sin saldos pendientes!</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Orden</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Cliente</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Dispositivo</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600">Estado</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Total</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Pagado</th>
                    <th className="text-right px-4 py-3 font-medium text-red-600">Saldo</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600">Metodo</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pending.map(o => (
                    <tr key={o.id} className="hover:bg-red-50 transition-colors">
                      <td className="px-4 py-3">
                        <Link to={`/orders/${o.id}`} className="font-mono text-blue-600 hover:underline font-medium">{o.order_number}</Link>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{o.customer_name}</p>
                        {o.customer_phone && <p className="text-xs text-gray-400">{o.customer_phone}</p>}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{o.device_type}{o.brand ? ` - ${o.brand}` : ''}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${ORDER_STATUS_COLORS[o.status]}`}>
                          {ORDER_STATUS_LABELS[o.status] || o.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">{formatCurrency(o.final_cost)}</td>
                      <td className="px-4 py-3 text-right text-green-600">{formatCurrency(o.paid_amount)}</td>
                      <td className="px-4 py-3 text-right font-bold text-red-600">{formatCurrency(o.balance)}</td>
                      <td className="px-4 py-3 text-center text-xs text-gray-500">{PAYMENT_METHOD_LABELS[o.payment_method] || o.payment_method}</td>
                      <td className="px-4 py-3 text-center text-xs text-gray-500">{o.received_date || '-'}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-red-50 border-t-2 border-red-100">
                  <tr>
                    <td colSpan={6} className="px-4 py-3 text-sm font-semibold text-gray-700">Total adeudado ({pending.length})</td>
                    <td className="px-4 py-3 text-right font-bold text-red-600">{formatCurrency(summary.pending_balance_total)}</td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/* ---- SALES SECTION ---- */
const SalesSection = ({ data }) => {
  const [tab, setTab] = useState('list');
  if (!data) return <Spinner />;

  const summary = data.summary || {};
  const sales = data.sales || [];
  const pending = data.pending_sales || [];
  const total = summary.total_income || 0;

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Ventas"
          value={formatCurrency(total)}
          sub={`${summary.sales_count || 0} ventas`}
          color="green"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
        <StatCard
          label="Costo Mercaderia"
          value={formatCurrency(summary.total_cost)}
          sub={`${pct(summary.total_cost, total)}% del total`}
          color="orange"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
        />
        <StatCard
          label="Ganancia Neta"
          value={formatCurrency(summary.total_profit)}
          sub={`${pct(summary.total_profit, total)}% del total`}
          color="purple"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />
        <StatCard
          label="Saldo Pendiente"
          value={formatCurrency(summary.pending_balance_total)}
          sub={`${summary.pending_sales_count || 0} ventas con deuda`}
          color="red"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {total > 0 && (
        <DistBar segments={[
          { label: 'Ganancia', value: summary.total_profit, pct: pct(summary.total_profit, total), color: 'bg-purple-500' },
          { label: 'Costo', value: summary.total_cost, pct: pct(summary.total_cost, total), color: 'bg-orange-400' },
          { label: 'Descuentos', value: summary.total_discount, pct: pct(summary.total_discount, total), color: 'bg-gray-300' },
        ]} />
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 flex">
          <button
            onClick={() => setTab('list')}
            className={`px-5 py-3 text-sm font-medium transition-colors ${tab === 'list' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Ventas del periodo ({sales.length})
          </button>
          <button
            onClick={() => setTab('pending')}
            className={`px-5 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${tab === 'pending' ? 'border-b-2 border-red-500 text-red-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Saldos pendientes
            {pending.length > 0 && (
              <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{pending.length}</span>
            )}
          </button>
        </div>

        {tab === 'list' && (
          <div className="overflow-x-auto">
            {sales.length === 0 ? (
              <Empty message="No hay ventas en este periodo" />
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Ticket</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Cliente</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600">Productos</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Subtotal</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Descuento</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Total</th>
                    <th className="text-right px-4 py-3 font-medium text-orange-600">Costo</th>
                    <th className="text-right px-4 py-3 font-medium text-purple-600">Ganancia</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600">Cobro</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sales.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <Link to={`/sales/${s.id}`} className="font-mono text-blue-600 hover:underline font-medium">{s.sale_number}</Link>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">{s.customer_name}</td>
                      <td className="px-4 py-3 text-center text-gray-500">{s.items_count}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(s.subtotal)}</td>
                      <td className="px-4 py-3 text-right text-gray-400">
                        {s.discount > 0 ? `-${formatCurrency(s.discount)}` : <span className="text-gray-300">-</span>}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">{formatCurrency(s.total)}</td>
                      <td className="px-4 py-3 text-right text-orange-600">{formatCurrency(s.cost)}</td>
                      <td className="px-4 py-3 text-right text-purple-600 font-medium">{formatCurrency(s.profit)}</td>
                      <td className="px-4 py-3 text-center text-xs text-gray-500">{PAYMENT_METHOD_LABELS[s.payment_method] || s.payment_method}</td>
                      <td className="px-4 py-3 text-center text-xs text-gray-500">{s.date || '-'}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                  <tr>
                    <td colSpan={5} className="px-4 py-3 text-sm font-semibold text-gray-700">Total ({sales.length})</td>
                    <td className="px-4 py-3 text-right font-bold">{formatCurrency(summary.total_income)}</td>
                    <td className="px-4 py-3 text-right font-bold text-orange-600">{formatCurrency(summary.total_cost)}</td>
                    <td className="px-4 py-3 text-right font-bold text-purple-600">{formatCurrency(summary.total_profit)}</td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        )}

        {tab === 'pending' && (
          <div className="overflow-x-auto">
            {pending.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-12 h-12 mx-auto mb-3 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-green-600 font-medium">Sin saldos pendientes en ventas!</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Ticket</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Cliente</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Total</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Pagado</th>
                    <th className="text-right px-4 py-3 font-medium text-red-600">Saldo</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600">Estado</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pending.map(s => (
                    <tr key={s.id} className="hover:bg-red-50 transition-colors">
                      <td className="px-4 py-3">
                        <Link to={`/sales/${s.id}`} className="font-mono text-blue-600 hover:underline font-medium">{s.sale_number}</Link>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">{s.customer_name}</td>
                      <td className="px-4 py-3 text-right font-semibold">{formatCurrency(s.total)}</td>
                      <td className="px-4 py-3 text-right text-green-600">{formatCurrency(s.paid_amount)}</td>
                      <td className="px-4 py-3 text-right font-bold text-red-600">{formatCurrency(s.balance)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${PAYMENT_STATUS_COLORS[s.payment_status]}`}>
                          {PAYMENT_STATUS_LABELS[s.payment_status] || s.payment_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-gray-500">{s.date || '-'}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-red-50 border-t-2 border-red-100">
                  <tr>
                    <td colSpan={4} className="px-4 py-3 text-sm font-semibold text-gray-700">Total adeudado ({pending.length})</td>
                    <td className="px-4 py-3 text-right font-bold text-red-600">{formatCurrency(summary.pending_balance_total)}</td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/* ---- MAIN PAGE ---- */
const Caja = () => {
  const [period, setPeriod] = useState('month');
  const [dateFrom, setDateFrom] = useState(getMonthStartStr());
  const [dateTo, setDateTo] = useState(getTodayStr());
  const [section, setSection] = useState('orders');
  const [ordersData, setOrdersData] = useState(null);
  const [salesData, setSalesData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = period === 'custom' ? { date_from: dateFrom, date_to: dateTo } : { period };
      const [oData, sData] = await Promise.all([
        ordersService.getCaja(params),
        salesService.getCaja(params),
      ]);
      setOrdersData(oData);
      setSalesData(sData);
    } catch (err) {
      setError('Error al cargar los datos de caja');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [period, dateFrom, dateTo]);

  useEffect(() => {
    if (period !== 'custom') loadData();
  }, [period, loadData]);

  const totalPending =
    (ordersData?.summary?.pending_balance_total || 0) +
    (salesData?.summary?.pending_balance_total || 0);

  const pendingCount =
    (ordersData?.summary?.pending_orders_count || 0) +
    (salesData?.summary?.pending_sales_count || 0);

  const dateLabel = ordersData ? `${ordersData.date_from} al ${ordersData.date_to}` : null;

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Caja</h1>
            <p className="text-gray-500 mt-1">Control de ingresos, costos y saldos pendientes</p>
          </div>
          <PendingAlert count={pendingCount} total={totalPending} />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-gray-600">Periodo:</span>
            <div className="flex flex-wrap gap-2">
              {PERIODS.map(p => (
                <button
                  key={p.key}
                  onClick={() => { setPeriod(p.key); if (p.key !== 'custom') setError(null); }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${period === p.key ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            {period === 'custom' && (
              <form onSubmit={(e) => { e.preventDefault(); loadData(); }} className="flex flex-wrap items-center gap-2 ml-2">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={e => setDateFrom(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-500 text-sm">al</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={e => setDateTo(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                  Buscar
                </button>
              </form>
            )}
            <button
              onClick={loadData}
              disabled={loading}
              className="ml-auto p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Actualizar"
            >
              <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
          {dateLabel && <p className="text-xs text-gray-400 mt-2">{dateLabel}</p>}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>
        )}
        {loading && !ordersData && !salesData && <Spinner />}

        {(ordersData || salesData) && (
          <>
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setSection('orders')}
                className={`flex-1 sm:flex-none px-6 py-3 rounded-xl text-sm font-semibold border-2 transition-all duration-200 ${section === 'orders' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}
              >
                Ordenes de Reparacion
                {ordersData && (
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${section === 'orders' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {ordersData.summary?.delivered_count || 0}
                  </span>
                )}
              </button>
              <button
                onClick={() => setSection('sales')}
                className={`flex-1 sm:flex-none px-6 py-3 rounded-xl text-sm font-semibold border-2 transition-all duration-200 ${section === 'sales' ? 'bg-purple-600 text-white border-purple-600 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'}`}
              >
                Ventas
                {salesData && (
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${section === 'sales' ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {salesData.summary?.sales_count || 0}
                  </span>
                )}
              </button>
            </div>
            {section === 'orders' && <OrdersSection data={ordersData} />}
            {section === 'sales' && <SalesSection data={salesData} />}
          </>
        )}
      </div>
    </>
  );
};

export default Caja;
