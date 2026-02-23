# 📖 Manual de Inicio - Sistema PuntoTecno

## 🔐 Acceso al Sistema

**URL:** https://punto-tecno.vercel.app

### Usuarios Disponibles

#### 👤 Administrador
- **Usuario:** Daniel
- **Contraseña:** admin2026
- **Acceso:** Panel completo con todas las funcionalidades

#### 👤 Empleado/Técnico
- **Usuario:** [tu usuario empleado]
- **Contraseña:** [tu contraseña empleado]
- **Acceso:** Panel de empleado con funciones limitadas

---

## 🚀 Pasos Iniciales para Configurar el Sistema

### 1️⃣ **Crear Categorías de Productos** (Administrador)

**Ruta:** Inventario → Categorías

Ejemplos sugeridos:
- Notebooks
- Componentes
- Periféricos
- Accesorios
- Repuestos

**Por qué primero:** Los productos necesitan categorías para ser creados.

---

### 2️⃣ **Cargar Productos** (Administrador)

**Ruta:** Inventario → Productos → Nuevo Producto

Para cada producto, completar:
- **Nombre:** Ej. "Notebook Lenovo IdeaPad"
- **SKU:** Código único (ej. "NB-LEN-001")
- **Categoría:** Seleccionar una creada en el paso 1
- **Precio de compra:** Lo que te costó
- **Precio de venta:** Lo que cobrarás
- **Stock inicial:** Cantidad disponible
- **Stock mínimo:** Alerta cuando baje de este número
- **Descripción:** Detalles del producto

**Recomendación:** Empieza con 5-10 productos para probar el sistema.

---

### 3️⃣ **Registrar Clientes** (Administrador o Empleado)

**Ruta:** Clientes → Nuevo Cliente

Datos necesarios:
- **Nombre completo**
- **Email**
- **Teléfono** (mínimo uno)
- **Dirección** (opcional)

**Importante:** Los clientes son necesarios para crear órdenes y ventas.

---

### 4️⃣ **Crear Órdenes de Reparación** (Administrador o Empleado)

**Ruta:** Órdenes → Nueva Orden

Completar:
- **Cliente:** Seleccionar uno existente
- **Descripción del problema:** Ej. "Notebook no enciende"
- **Estado:** Pendiente (por defecto)
- **Prioridad:** Normal, Alta o Baja
- **Notas internas:** Diagnóstico inicial

El sistema generará automáticamente un número de orden.

---

### 5️⃣ **Registrar Ventas** (Administrador o Empleado)

**Ruta:** Ventas → Nueva Venta

Pasos:
1. Seleccionar **Cliente**
2. Agregar **Productos** (buscar y seleccionar)
3. Especificar **Cantidad** de cada producto
4. El sistema calcula automáticamente el **Total**
5. Elegir **Método de pago**:
   - Efectivo
   - Transferencia
   - Tarjeta débito
   - Tarjeta crédito
   - Mercado Pago
6. **Guardar venta**

**Nota:** El stock se descuenta automáticamente.

---

## 📊 Funciones del Panel Administrador

### Dashboard
- Resumen de órdenes por estado
- Ventas del día/mes
- Alertas de stock bajo
- Estadísticas generales

### Gestión Completa
- ✅ Ver, crear, editar y eliminar todo
- ✅ Gestionar usuarios
- ✅ Ver reportes
- ✅ Administrar inventario completo

---

## 👷 Funciones del Panel Empleado

### Acceso Limitado
- ✅ Ver y crear órdenes
- ✅ Ver y crear ventas
- ✅ Ver productos (sin modificar precios)
- ✅ Ver y crear clientes
- ❌ No puede eliminar registros
- ❌ No puede modificar inventario
- ❌ No puede ver usuarios ni configuración

---

## 💡 Consejos Importantes

### ⚠️ Stock
- El sistema **descuenta automáticamente** el stock al hacer ventas
- Configurá **stock mínimo** para recibir alertas
- Revisá periódicamente las alertas de stock bajo

### 📝 Órdenes de Reparación
- Actualizá el **estado** cuando avance el trabajo:
  - Pendiente → En Progreso → Completada → Entregada
- Usá las **notas** para dejar comentarios del proceso
- El cliente puede ver el estado de su orden

### 💰 Ventas
- Verificá el **stock disponible** antes de vender
- El **método de pago** queda registrado para reportes
- Podés agregar **pagos parciales** si es cuenta corriente

### 🔒 Seguridad
- Cambiá las contraseñas después del primer acceso
- No compartas las credenciales de administrador
- Cerrá sesión cuando no uses el sistema

---

## 📞 Soporte

Si tenés problemas o dudas:
1. Revisá este manual
2. Contactá al desarrollador

---

## ✅ Checklist de Configuración Inicial

- [ ] Iniciar sesión como Administrador
- [ ] Crear al menos 3 categorías
- [ ] Cargar 5-10 productos iniciales
- [ ] Registrar 2-3 clientes de prueba
- [ ] Crear una orden de prueba
- [ ] Registrar una venta de prueba
- [ ] Verificar que el stock se descontó
- [ ] Revisar el dashboard

**¡Listo para usar!** 🎉
