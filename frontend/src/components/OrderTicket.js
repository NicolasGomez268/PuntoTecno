import { formatPrice } from '../utils/format';

const OrderTicket = ({ order, duplicate = 'TÉCNICO' }) => {
  const DEVICE_TYPES = {
    'celular': 'Celular',
    'tablet': 'Tablet',
    'notebook': 'Notebook',
    'pc': 'PC',
    'otro': 'Otro'
  };

  const PAYMENT_METHODS = {
    'cash': 'Efectivo',
    'transfer': 'Transferencia',
    'not_paid': 'Sin Abonar',
    'account': 'Cuenta Corriente'
  };

  return (
    <div className="ticket-page">

      {/* Fila 1: Datos negocio | Número de orden */}
      <div className="tk-row">
        <div className="tk-cell">
          <div className="business-name">PuntoTecno</div>
          <div className="business-contact">Cel: 385 4845623 | 3841 408596</div>
          <div className="business-contact">B°Centro</div>
          <div className="business-contact">puntotecno002@gmail.com</div>
        </div>
        <div className="tk-cell">
          <div className="tk-cell-label">NÚMERO DE ORDEN</div>
          <div className="order-number">N° {order.order_number}</div>
          <div className="order-date">Fecha: {new Date(order.received_date).toLocaleDateString('es-AR')}</div>
          <div className="order-date">Copia: <strong>{duplicate}</strong></div>
        </div>
      </div>

      {/* Fila 2: Datos cliente | Datos equipo */}
      <div className="tk-row">
        <div className="tk-cell">
          <div className="tk-cell-label">DATOS DEL CLIENTE</div>
          <div className="info-row"><span className="info-label">Nombre:</span><span className="info-value">{order.customer_name}</span></div>
          <div className="info-row"><span className="info-label">Teléfono:</span><span className="info-value">{order.customer_phone}</span></div>
          {order.customer_email && (
            <div className="info-row"><span className="info-label">Email:</span><span className="info-value">{order.customer_email}</span></div>
          )}
        </div>
        <div className="tk-cell">
          <div className="tk-cell-label">DATOS DEL EQUIPO</div>
          <div className="info-row"><span className="info-label">Tipo:</span><span className="info-value">{DEVICE_TYPES[order.device_type]}</span></div>
          <div className="info-row"><span className="info-label">Marca:</span><span className="info-value">{order.device_brand}</span></div>
          <div className="info-row"><span className="info-label">Modelo:</span><span className="info-value">{order.device_model}</span></div>
          {order.device_color && (
            <div className="info-row"><span className="info-label">Color:</span><span className="info-value">{order.device_color}</span></div>
          )}
          {order.device_serial && (
            <div className="info-row"><span className="info-label">Serial/IMEI:</span><span className="info-value">{order.device_serial}</span></div>
          )}
          {order.security_data && (
            <div className="info-row"><span className="info-label">Contraseña:</span><span className="info-value">{order.security_data}</span></div>
          )}
        </div>
      </div>

      {/* Fila 3: Observaciones | Descripción de reparación */}
      <div className="tk-row">
        <div className="tk-cell">
          <div className="tk-cell-label">OBSERVACIONES</div>
          <div className="tk-cell-content">{order.general_observations || order.problem_description || '—'}</div>
        </div>
        <div className="tk-cell">
          <div className="tk-cell-label">DESCRIPCIÓN DE REPARACIÓN</div>
          <div className="tk-cell-content">{order.diagnosis || order.repair_notes || 'Pendiente de diagnóstico'}</div>
        </div>
      </div>

      {/* Fila 4: Presupuesto | Términos y condiciones */}
      <div className="tk-row">
        <div className="tk-cell">
          <div className="tk-cell-label">PRESUPUESTO</div>
          <div className="total-row">
            <span className="info-label">Adelanto/Seña:</span>
            <span>${formatPrice(order.deposit_amount || 0)}</span>
          </div>
          {order.estimated_cost && (
            <div className="total-row">
              <span className="info-label">Presupuesto:</span>
              <span>${formatPrice(order.estimated_cost)}</span>
            </div>
          )}
          {order.final_cost && (
            <div className="total-row total-row-main">
              <span className="info-label">TOTAL:</span>
              <span>${formatPrice(order.final_cost)}</span>
            </div>
          )}
          <div className="total-row">
            <span className="info-label">Forma de Pago:</span>
            <span>{PAYMENT_METHODS[order.payment_method]}</span>
          </div>
          {order.payment_method === 'account' && (
            <>
              <div className="total-row">
                <span className="info-label">Monto Pagado:</span>
                <span style={{ fontWeight: 'bold' }}>
                  ${formatPrice(order.paid_amount || 0)}
                </span>
              </div>
              {order.balance > 0 && (
                <div className="total-row">
                  <span className="info-label">Saldo Pendiente:</span>
                  <span style={{ fontWeight: 'bold' }}>
                    ${formatPrice(order.balance)}
                  </span>
                </div>
              )}
              {order.payment_status === 'paid' && (
                <div className="total-row" style={{ fontWeight: 'bold' }}>
                  ✓ PAGADO COMPLETO
                </div>
              )}
            </>
          )}
        </div>
        <div className="tk-cell">
          <div className="tk-cell-label">TÉRMINOS Y CONDICIONES</div>
          <ul className="terms-list">
            <li>El plazo de reparación es estimado y puede variar según disponibilidad de repuestos.</li>
            <li>El presupuesto tiene una validez de 15 días.</li>
            <li>Pasados 60 días sin retirar el equipo, se cobrará un adicional por almacenamiento.</li>
            <li>No nos hacemos responsables por la información contenida en el equipo.</li>
            <li>Es necesario presentar este comprobante para retirar el equipo.</li>
          </ul>
        </div>
      </div>

      {/* Fila 5: Firmas */}
      <div className="tk-row">
        <div className="tk-cell tk-cell-firma">
          <div className="signature-line"></div>
          <p className="signature-label">Firma del Cliente</p>
          <p className="signature-sublabel">Aclaración: {order.customer_name}</p>
        </div>
        <div className="tk-cell tk-cell-firma">
          <div className="signature-line"></div>
          <p className="signature-label">Firma del Técnico</p>
          <p className="signature-sublabel">Aclaración: {order.assigned_to_name || order.created_by_name}</p>
        </div>
      </div>

      {/* Fila 6: Indicador de copia */}
      <div className="tk-cell-copy">
        <strong>COPIA {duplicate}</strong>
      </div>

    </div>
  );
};

export default OrderTicket;
