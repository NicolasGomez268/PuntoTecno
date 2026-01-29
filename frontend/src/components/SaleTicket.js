
const SaleTicket = ({ sale }) => {
  const PAYMENT_METHODS = {
    'cash': 'Efectivo',
    'card': 'Tarjeta',
    'transfer': 'Transferencia',
    'multiple': 'Múltiple',
    'account': 'Cuenta Corriente'
  };

  const PAYMENT_STATUS = {
    'paid': 'Pagado',
    'partial': 'Pago Parcial',
    'pending': 'Pendiente'
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

      {/* Número de Ticket */}
      <div className="order-number-section">
        <h2 className="section-title">TICKET DE VENTA</h2>
        <div className="order-number">N° {sale.ticket_number}</div>
        <div className="order-date">
          Fecha: {new Date(sale.date).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>

      <div className="ticket-divider"></div>

      {/* Datos del Cliente */}
      <div className="ticket-section">
        <h3 className="section-subtitle">DATOS DEL CLIENTE</h3>
        <div className="info-row">
          <span className="info-label">Cliente:</span>
          <span className="info-value">{sale.customer_display}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Vendedor:</span>
          <span className="info-value">{sale.employee_name}</span>
        </div>
      </div>

      <div className="ticket-divider"></div>

      {/* Productos */}
      <div className="ticket-section">
        <h3 className="section-subtitle">PRODUCTOS</h3>
        <table style={{ width: '100%', fontSize: '10px', marginTop: '5px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #000' }}>
              <th style={{ textAlign: 'left', padding: '3px 0' }}>Producto</th>
              <th style={{ textAlign: 'center', padding: '3px 5px' }}>Cant.</th>
              <th style={{ textAlign: 'right', padding: '3px 0' }}>Precio</th>
              <th style={{ textAlign: 'right', padding: '3px 0' }}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {sale.items.map((item, index) => (
              <tr key={index} style={{ borderBottom: '1px dashed #ccc' }}>
                <td style={{ padding: '3px 0' }}>
                  <div style={{ fontWeight: 'bold' }}>{item.product_name}</div>
                  <div style={{ fontSize: '8px', color: '#666' }}>SKU: {item.product_sku}</div>
                </td>
                <td style={{ textAlign: 'center', padding: '3px 5px' }}>{item.quantity}</td>
                <td style={{ textAlign: 'right', padding: '3px 0' }}>${parseFloat(item.unit_price).toFixed(2)}</td>
                <td style={{ textAlign: 'right', padding: '3px 0' }}>${parseFloat(item.subtotal).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="ticket-divider"></div>

      {/* Totales */}
      <div className="ticket-section">
        <div className="totals-section">
          <div className="total-row">
            <span className="total-label">Subtotal:</span>
            <span className="total-value">${parseFloat(sale.subtotal).toFixed(2)}</span>
          </div>
          {sale.discount > 0 && (
            <div className="total-row">
              <span className="total-label">Descuento:</span>
              <span className="total-value">-${parseFloat(sale.discount).toFixed(2)}</span>
            </div>
          )}
          <div className="total-row total-row-main">
            <span className="total-label">TOTAL:</span>
            <span className="total-value">${parseFloat(sale.total).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="ticket-divider"></div>

      {/* Información de Pago */}
      <div className="ticket-section">
        <h3 className="section-subtitle">INFORMACIÓN DE PAGO</h3>
        <div className="info-row">
          <span className="info-label">Método de Pago:</span>
          <span className="info-value">{PAYMENT_METHODS[sale.payment_method]}</span>
        </div>
        
        {sale.payment_method === 'account' && (
          <>
            <div className="info-row">
              <span className="info-label">Estado:</span>
              <span className="info-value">{PAYMENT_STATUS[sale.payment_status]}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Monto Pagado:</span>
              <span className="info-value">${parseFloat(sale.paid_amount || 0).toFixed(2)}</span>
            </div>
            {sale.balance > 0 && (
              <div className="info-row" style={{ fontWeight: 'bold', marginTop: '3px' }}>
                <span className="info-label">Saldo Pendiente:</span>
                <span className="info-value">${parseFloat(sale.balance).toFixed(2)}</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Notas */}
      {sale.notes && (
        <>
          <div className="ticket-divider"></div>
          <div className="ticket-section">
            <h3 className="section-subtitle">OBSERVACIONES</h3>
            <div className="observations-box" style={{ minHeight: '30px' }}>
              {sale.notes}
            </div>
          </div>
        </>
      )}

      <div className="ticket-divider"></div>

      {/* Firma */}
      <div className="signatures-section" style={{ margin: '15px 0' }}>
        <div className="signature-box">
          <div className="signature-line"></div>
          <p className="signature-label">Firma del Cliente</p>
          <p className="signature-sublabel">Aclaración: {sale.customer_display}</p>
        </div>
      </div>

      <div className="ticket-divider"></div>

      {/* Mensaje de agradecimiento */}
      <div style={{ textAlign: 'center', fontSize: '9px', marginTop: '10px' }}>
        <p style={{ fontWeight: 'bold' }}>¡GRACIAS POR SU COMPRA!</p>
        <p>Conserve este ticket para cambios y devoluciones</p>
      </div>
    </div>
  );
};

export default SaleTicket;
