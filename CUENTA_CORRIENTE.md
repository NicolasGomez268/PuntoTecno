# Cuenta Corriente - Sistema Implementado

## ✅ Cambios Realizados

### Backend
1. **Modelo Sale** (`backend/sales/models.py`):
   - ✅ Agregado `payment_method` = `'account'` (Cuenta Corriente)
   - ✅ Agregado `payment_status`: `'paid'`, `'partial'`, `'pending'`
   - ✅ Agregado `paid_amount` (monto pagado)
   - ✅ Agregado `balance` (saldo pendiente)
   - ✅ Lógica automática: calcula balance según método de pago

2. **Serializer** (`backend/sales/serializers.py`):
   - ✅ Incluidos nuevos campos en API
   - ✅ Campos read-only: `balance`, `payment_status`

3. **Migración**: 
   - ✅ Creada: `backend/sales/migrations/0002_sale_account_fields.py`

### Frontend
1. **Nueva Venta** (`frontend/src/pages/NewSale.js`):
   - ✅ Opción "Cuenta Corriente" en método de pago
   - ✅ Campo para pago parcial (aparece solo si es cuenta corriente)
   - ✅ Muestra saldo pendiente en tiempo real

2. **Detalle de Venta** (`frontend/src/pages/SaleDetail.js`):
   - ✅ Muestra estado de pago (Pagado/Parcial/Pendiente)
   - ✅ Muestra monto pagado
   - ✅ Destaca saldo pendiente en rojo

3. **Lista de Ventas** (`frontend/src/pages/Sales.js`):
   - ✅ Badge de "C. Corriente"
   - ✅ Indicador de estado (Pagado/Parcial/Pendiente)

## 📋 Para Aplicar la Migración

**IMPORTANTE**: Debes detener el servidor de Django, aplicar la migración y reiniciarlo.

### Opción 1: Desde PowerShell
```powershell
# Detener el servidor Django (Ctrl+C en la terminal donde corre)

# Ir al directorio backend
cd c:\Users\Usuario\Documents\Proyectos2026\PuntoTecno\backend

# Aplicar migración
..\.venv\Scripts\python.exe manage.py migrate

# Reiniciar servidor
..\.venv\Scripts\python.exe manage.py runserver
```

### Opción 2: Aplicar manualmente
1. Ve a la terminal donde corre Django
2. Presiona `Ctrl+C` para detener el servidor
3. Ejecuta: `python manage.py migrate`
4. Reinicia con: `python manage.py runserver`

## 🎯 Cómo Usar

### Venta con Cuenta Corriente:
1. Ir a "Nueva Venta"
2. Agregar productos al carrito
3. Seleccionar cliente (obligatorio para cuenta corriente)
4. En "Método de Pago" elegir **"Cuenta Corriente"**
5. **Opciones**:
   - Dejar pago en $0 → Venta totalmente fiada (estado: Pendiente)
   - Pagar algo → Pago parcial (estado: Parcial)
   - Pagar total → Pagado completamente (estado: Pagado)

### Ver Deuda:
- En lista de ventas: ver badge de estado junto a "C. Corriente"
- En detalle: ver monto pagado y saldo pendiente destacado

## 💡 Lógica Automática
- **Efectivo/Tarjeta/Transferencia**: `paid_amount` = total, `balance` = 0, estado = Pagado
- **Cuenta Corriente con pago parcial**: calcula balance automáticamente
- **Cuenta Corriente sin pago**: balance = total, estado = Pendiente

## 🔄 Próximas Mejoras (Opcional)
- Registrar pagos parciales posteriores
- Ver historial de movimientos de cuenta por cliente
- Reporte de clientes con deuda
- Alertas de saldos vencidos
