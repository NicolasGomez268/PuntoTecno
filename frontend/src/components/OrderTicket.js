
const OrderTicket = ({ order, duplicate = 'TÉCNICO' }) => {
  const DEVICE_TYPES = {
    'celular': 'Celular',
    'tablet': 'Tablet',
    'notebook': 'Notebook',
    'pc': 'PC',
    'otro': 'Otro'
  };

  const PAYMENT_METHODS = {
    'efectivo': 'Efectivo',
    'transferencia': 'Transferencia',
    'debito': 'Débito',
    'credito': 'Crédito',
    'account': 'Cuenta Corriente'
  };

  return (
    <div className="ticket-page">
      {/* Header con Logo y Contacto */}
      <div className="ticket-header">
        <div className="business-info">
          <h1 className="business-name">PUNTOTECNO</h1>
          <p className="business-contact">Tel: 3794-123456 / 3794-654321</p>
          <p className="business-contact">Email: contacto@puntotecno.com</p>
          <p className="business-address">Dirección: Av. Principal 123, Corrientes</p>
        </div>
      </div>

      <div className="ticket-divider"></div>

      {/* Número de Orden */}
      <div className="order-number-section">
        <h2 className="section-title">ORDEN DE SERVICIO</h2>
        <div className="order-number">N° {order.order_number}</div>
        <div className="order-date">
          Fecha: {new Date(order.received_date).toLocaleDateString('es-AR')}
        </div>
      </div>

      <div className="ticket-divider"></div>

      {/* Datos del Cliente */}
      <div className="ticket-section">
        <h3 className="section-subtitle">DATOS DEL CLIENTE</h3>
        <div className="info-row">
          <span className="info-label">Nombre:</span>
          <span className="info-value">{order.customer_name}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Teléfono:</span>
          <span className="info-value">{order.customer_phone}</span>
        </div>
        {order.customer_email && (
          <div className="info-row">
            <span className="info-label">Email:</span>
            <span className="info-value">{order.customer_email}</span>
          </div>
        )}
      </div>

      <div className="ticket-divider"></div>

      {/* Datos del Equipo */}
      <div className="ticket-section">
        <h3 className="section-subtitle">DATOS DEL EQUIPO</h3>
        <div className="info-row">
          <span className="info-label">Tipo:</span>
          <span className="info-value">{DEVICE_TYPES[order.device_type]}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Marca:</span>
          <span className="info-value">{order.device_brand}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Modelo:</span>
          <span className="info-value">{order.device_model}</span>
        </div>
        {order.device_color && (
          <div className="info-row">
            <span className="info-label">Color:</span>
            <span className="info-value">{order.device_color}</span>
          </div>
        )}
        {order.device_serial && (
          <div className="info-row">
            <span className="info-label">Serial/IMEI:</span>
            <span className="info-value">{order.device_serial}</span>
          </div>
        )}
        {order.security_data && (
          <div className="info-row">
            <span className="info-label">Datos Seguridad:</span>
            <span className="info-value">{order.security_data}</span>
          </div>
        )}
      </div>

      <div className="ticket-divider"></div>

      {/* Observaciones */}
      <div className="ticket-section">
        <h3 className="section-subtitle">OBSERVACIONES</h3>
        <div className="observations-box">
          {order.general_observations || order.problem_description || 'Sin observaciones'}
        </div>
      </div>

      <div className="ticket-divider"></div>

      {/* Descripción de Reparación */}
      <div className="ticket-section">
        <h3 className="section-subtitle">DESCRIPCIÓN DE REPARACIÓN/SERVICIO</h3>
        <div className="observations-box">
          {order.diagnosis || order.repair_notes || 'Pendiente de diagnóstico'}
        </div>
      </div>

      <div className="ticket-divider"></div>

      {/* Totales */}
      <div className="ticket-section">
        <div className="totals-section">
          <div className="total-row">
            <span className="total-label">Adelanto/Seña:</span>
            <span className="total-value">${parseFloat(order.deposit_amount || 0).toFixed(2)}</span>
          </div>
          {order.estimated_cost && (
            <div className="total-row">
              <span className="total-label">Presupuesto:</span>
              <span className="total-value">${parseFloat(order.estimated_cost).toFixed(2)}</span>
            </div>
          )}
          {order.final_cost && (
            <div className="total-row total-row-main">
              <span className="total-label">TOTAL:</span>
              <span className="total-value">${parseFloat(order.final_cost).toFixed(2)}</span>
            </div>
          )}
          <div className="total-row">
            <span className="total-label">Forma de Pago:</span>
            <span className="total-value">{PAYMENT_METHODS[order.payment_method]}</span>
          </div>
        </div>
      </div>

      <div className="ticket-divider"></div>

      {/* Términos y Condiciones */}
      <div className="ticket-section terms-section">
        <h3 className="section-subtitle">TÉRMINOS Y CONDICIONES</h3>
        <ul className="terms-list">
          <li>El plazo de reparación es estimado y puede variar según disponibilidad de repuestos.</li>
          <li>El presupuesto tiene una validez de 15 días.</li>
          <li>Pasados 60 días sin retirar el equipo, se cobrará un adicional por almacenamiento.</li>
          <li>No nos hacemos responsables por la información contenida en el equipo.</li>
          <li>Es necesario presentar este comprobante para retirar el equipo.</li>
        </ul>
      </div>

      <div className="ticket-divider"></div>

      {/* Firmas */}
      <div className="signatures-section">
        <div className="signature-box">
          <div className="signature-line"></div>
          <p className="signature-label">Firma del Cliente</p>
          <p className="signature-sublabel">Aclaración: {order.customer_name}</p>
        </div>
        <div className="signature-box">
          <div className="signature-line"></div>
          <p className="signature-label">Firma del Técnico</p>
          <p className="signature-sublabel">Aclaración: {order.assigned_to_name || order.created_by_name}</p>
        </div>
      </div>

      {/* Indicador de Duplicado */}
      <div className="duplicate-indicator">
        <strong>COPIA {duplicate}</strong>
      </div>
    </div>
  );
};

export default OrderTicket;
