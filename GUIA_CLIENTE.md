# 🎯 GUÍA RÁPIDA PARA EL CLIENTE - PuntoTecno

## 📱 Sistema Adaptado a Tu Forma de Trabajo

Hola! He creado tu sistema de gestión **exactamente como lo usabas antes**, pero mejorado. 

---

## ✅ LO QUE PEDISTE vs LO QUE TIENE EL SISTEMA

### 👥 CLIENTES
**Lo que pediste:**
- ✅ DNI
- ✅ Nombre y apellido
- ✅ Número de cliente (opcional para búsqueda)
- ✅ Teléfono
- ✅ Email (opcional)

**Extra que agregué:**
- ✅ Búsqueda rápida por cualquier dato
- ✅ Historial automático de todas sus reparaciones

---

### 🔧 RECEPCIÓN DE EQUIPOS
**Tu flujo de trabajo:**
1. ✅ Primero agregas los datos del cliente
2. ✅ Guardas el cliente
3. ✅ Luego agregas los datos del equipo para generar la orden

**Datos del equipo que pediste:**
- ✅ Marca del equipo
- ✅ Modelo
- ✅ Color
- ✅ Serial (opcional)
- ✅ Datos de seguridad (clave, patrón, PIN)
- ✅ Tipo de reparación: celular, tablets, laptop

**Todo está implementado exactamente así!**

---

### 📋 REPARACIONES
**Estados que pediste:**
- ✅ Recibir equipo (se genera una orden)
- ✅ Iniciar servicio
- ✅ Estados: no reparado, reparado, no solucionado
- ✅ Carga diaria (ver equipos que se recibieron cada día)
- ✅ Buscador de órdenes

**Ya está funcionando!**

---

### 📦 INVENTARIO
**Lo que pediste:**
- ✅ Categorías
- ✅ Productos (cargar productos)
- ✅ Servicios para generar presupuestos
  - Ejemplo: "Reparación de pantalla Samsung A53 - $15,000"

**Todo implementado!**

---

### 💰 VENTAS/PAGOS
**Métodos de pago que pediste:**
- ✅ Efectivo
- ✅ Transferencia
- ✅ Sin abonar

**Plus:** El sistema calcula automáticamente el "Por Pagar"

---

### 🖨️ RECIBO
**Basado en tu imagen:**
- ✅ Número de orden con código de barras
- ✅ Fecha y hora
- ✅ Datos del cliente (DNI, nombre, teléfono, email)
- ✅ Datos del equipo (marca, modelo, color, serial, clave)
- ✅ Observaciones generales
- ✅ Reparación solicitada
- ✅ Total, Adelanto/Seña, Por Pagar
- ✅ Dos copias (Pestaña Técnico y Pestaña Cliente)

**Próximamente:** PDF con QR para seguimiento online

---

## 🚀 CÓMO USAR EL SISTEMA

### 1️⃣ PRIMER USO - Instalación

```bash
# 1. Abrir PowerShell en la carpeta del proyecto
cd c:\Users\Usuario\Documents\Proyectos2026\PuntoTecno

# 2. Instalar Backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

# 3. Crear base de datos
python manage.py makemigrations
python manage.py migrate

# 4. Cargar datos de ejemplo (RECOMENDADO para probar)
python manage.py create_sample_data

# 5. Iniciar servidor
python manage.py runserver
```

```bash
# 6. En OTRA terminal, instalar Frontend
cd c:\Users\Usuario\Documents\Proyectos2026\PuntoTecno\frontend
npm install

# 7. Iniciar aplicación
npm start
```

**Se abrirá automáticamente en:** http://localhost:3000

---

### 2️⃣ ACCEDER AL SISTEMA

**Usuario Administrador:**
- Usuario: `admin`
- Contraseña: `admin123`

**Usuario Técnico:**
- Usuario: `tecnico1`
- Contraseña: `tecnico123`

---

### 3️⃣ FLUJO DIARIO DE TRABAJO

#### 📥 RECIBIR UN EQUIPO

**Paso 1: Buscar o crear el cliente**
1. Ir a "Clientes"
2. Buscar por DNI o teléfono
3. Si no existe, hacer clic en "Nuevo Cliente":
   - Ingresar DNI
   - Nombre y apellido
   - Teléfono
   - Email (opcional)
   - Guardar

**Paso 2: Crear la orden**
1. Ir a "Órdenes" → "Nueva Orden"
2. Seleccionar el cliente que acabas de crear
3. Completar datos del equipo:
   - Tipo: Celular / Tablet / Notebook
   - Marca: Apple, Samsung, Motorola, etc.
   - Modelo: iPhone 13 Pro, A53, etc.
   - Color: blanco, negro, azul, etc.
   - Serial/IMEI (si tiene)
   - Datos de seguridad: "Clave: 1234" o "Patrón: L invertida"
4. Describir el problema: "Pantalla rota", "No carga", etc.
5. Observaciones generales: "El equipo no enciende"
6. **Guardar**

✅ Se genera automáticamente un número de orden: ORD-000001

---

#### 🔧 TRABAJAR EN LA REPARACIÓN

**Desde el Dashboard:**
1. Ver "Órdenes Pendientes"
2. Hacer clic en la orden
3. Cambiar estado:
   - **Recibido** → **En Servicio** (cuando empiezas a trabajar)
   - **En Servicio** → **Reparado** (si se solucionó)
   - **En Servicio** → **No Reparado** (si no se puede reparar)
   - **En Servicio** → **No Solucionado** (si el problema persiste)
4. Agregar diagnóstico: "Se cambió la pantalla, todo funciona OK"
5. Poner costo final: $15,000
6. Si reparaste → cambiar a "Listo para Entrega"

---

#### 📤 ENTREGAR EL EQUIPO

1. Cambiar estado a "Entregado"
2. Seleccionar método de pago:
   - Efectivo
   - Transferencia
   - Sin abonar
3. Si pagó algo al recibir, poner en "Adelanto/Seña"
4. El sistema calcula automáticamente lo que falta pagar
5. **Guardar**

---

#### 📊 CARGA DIARIA (Ver equipos del día)

1. Ir a "Órdenes"
2. Filtrar por fecha de hoy
3. Verás todos los equipos que recibiste hoy

---

### 4️⃣ OTRAS FUNCIONALIDADES

#### 📦 GESTIONAR INVENTARIO

**Crear categoría:**
1. Ir a "Inventario" → "Categorías"
2. Nueva categoría: "Pantallas", "Baterías", "Tapas"

**Agregar producto:**
1. Ir a "Inventario" → "Productos"
2. Nuevo producto:
   - Categoría: Pantallas
   - Nombre: Pantalla Samsung A53
   - SKU: PAN-SAM-A53
   - Cantidad: 5
   - Stock mínimo: 2 (te avisará cuando llegues a 2)
   - Precio de compra: $12,000
   - Precio de venta: $15,000

**Alertas automáticas:**
- Si un producto llega al stock mínimo, aparece en "Alertas de Stock"

---

#### 💼 SERVICIOS (Presupuestos Rápidos)

**Crear servicio:**
1. Ir a "Inventario" → "Servicios"
2. Nuevo servicio:
   - Nombre: Cambio de Pantalla
   - Marca: Samsung
   - Modelo: A53
   - Precio: $15,000
   - Tiempo estimado: 2-3 días

**Usar servicio:**
- Cuando un cliente pregunta "¿Cuánto sale cambiar la pantalla de un A53?"
- Buscas en Servicios y ya tienes el precio

---

### 5️⃣ REPORTES Y ESTADÍSTICAS

**Dashboard Administrador muestra:**
- Órdenes pendientes
- Órdenes del mes
- Ingresos del mes
- Alertas de stock
- Gráficos de estado de órdenes

**Reportes:**
- Ir a "Reportes"
- Ver balance mensual
- Exportar a Excel (próximamente)

---

## ⚡ DIFERENCIAS CON EL SISTEMA ANTERIOR

### ✅ MEJORAS

| Antes | Ahora |
|-------|-------|
| Buscar cliente por nombre | Buscar por DNI, nombre, teléfono, email |
| Estados básicos | 8 estados detallados |
| Sin datos de seguridad | Puedes guardar claves y patrones |
| Sin color del equipo | Guardas el color |
| Calcular manualmente | Calcula automático el "Por Pagar" |
| Sin alertas de stock | Te avisa cuando falta stock |
| Un solo usuario | Admin y técnicos con diferentes permisos |

---

## 🆘 AYUDA RÁPIDA

### ❓ No puedo crear una orden
**Solución:** Primero debes crear el cliente, luego la orden.

### ❓ No aparece mi cliente en la lista
**Solución:** Busca por DNI o teléfono con el buscador.

### ❓ Quiero ver equipos del día
**Solución:** Dashboard → Ver todas → Filtrar por fecha.

### ❓ Olvidé mi contraseña
**Solución:** Contacta al administrador del sistema.

### ❓ No funciona el sistema
**Solución:** 
1. Verificar que el backend esté corriendo (PowerShell 1)
2. Verificar que el frontend esté corriendo (PowerShell 2)

---

## 📞 CONTACTO

**Desarrollador:** [Tu nombre]
**Email:** [Tu email]
**Fecha:** Enero 2026

---

## 🎉 DATOS DE EJEMPLO

El comando `create_sample_data` crea:

**3 Clientes:**
- Daniel Cisneros (DNI: 20123456789)
- María González (DNI: 27987654321)
- Carlos Rodríguez (DNI: 30456789012)

**3 Órdenes:**
- Orden 1: iPhone 13 Pro (Recibido)
- Orden 2: Samsung A53 (En Servicio)
- Orden 3: Motorola G52 (Listo para Entrega)

**5 Servicios:**
- Cambio Pantalla Samsung A53 - $15,000
- Cambio Batería iPhone 13 Pro - $12,000
- Cambio Tapa Samsung A53 - $5,000
- Limpieza Conector - $2,000
- Cambio Táctil Motorola G52 - $8,000

**4 Productos en Stock:**
- Pantalla Samsung A53 (5 unidades)
- Batería iPhone 13 Pro (8 unidades)
- Tapa Samsung A53 (3 unidades) ⚠️ Stock bajo
- Pantalla Motorola G52 (1 unidad) ⚠️ Stock bajo

---

## ✨ ¡TODO LISTO PARA USAR!

El sistema está **100% adaptado** a tu forma de trabajo anterior, pero con mejoras y sin perder nada de lo que hacías.

**¡Cualquier duda, consultame!** 😊
