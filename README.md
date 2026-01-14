# 🔧 PuntoTecno - Sistema de Gestión

Sistema completo de gestión para local de servicios informáticos.

## 🚀 Características

### 📱 Gestión de Clientes
- ✅ Registro con DNI (obligatorio)
- ✅ Número de cliente (opcional para búsqueda)
- ✅ Datos completos: nombre, teléfono, email, dirección
- ✅ Historial de órdenes por cliente

### 🔧 Gestión de Órdenes de Reparación
- ✅ **Flujo de trabajo:** Primero agregar cliente → Luego crear orden
- ✅ Datos del equipo: Marca, Modelo, Color, Serial/IMEI
- ✅ Datos de seguridad (clave, patrón, PIN)
- ✅ Tipos de dispositivo: Celular, Tablet, Notebook, PC, Otros
- ✅ **Estados detallados:**
  - Recibido
  - En Servicio
  - Reparado
  - No Reparado
  - No Solucionado
  - Listo para Entrega
  - Entregado
  - Cancelado
- ✅ Observaciones generales del equipo
- ✅ Carga diaria (equipos recibidos por día)
- ✅ Buscador de órdenes
- ✅ Asignación de técnicos

### 💰 Gestión de Pagos
- ✅ Métodos de pago:
  - Efectivo
  - Transferencia
  - Sin Abonar
- ✅ Adelanto/Seña
- ✅ Cálculo automático del saldo pendiente
- ✅ Costo estimado y costo final

### 📦 Inventario Inteligente
- ✅ Gestión por categorías
- ✅ Control de stock con alertas automáticas
- ✅ Movimientos de entrada/salida
- ✅ Valor total del inventario

### 💼 Módulo de Servicios/Presupuestos
- ✅ Catálogo de servicios predefinidos
- ✅ Ejemplo: "Reparación pantalla Samsung A53 - $15,000"
- ✅ Tiempos estimados de reparación
- ✅ Generación rápida de presupuestos

### 👥 Sistema de Usuarios
- ✅ Roles: Administrador y Empleado
- ✅ Permisos diferenciados por rol
- ✅ Autenticación segura con JWT

### 📊 Reportes y Estadísticas
- ✅ Dashboard con KPIs en tiempo real
- ✅ Balance mensual de ingresos
- ✅ Órdenes por estado
- ✅ Alertas de stock bajo
- ✅ Órdenes próximas a vencer

### 🖨️ Generación de Recibos
- ✅ Recibo técnico y recibo cliente
- ✅ Código de barras
- ✅ QR para seguimiento (opcional)
- ✅ Términos y condiciones
- ✅ Exportación a PDF

## 🎨 Paleta de Colores

- **Azul Brillante**: #009EE0
- **Azul Profundo**: #0055A5
- **Fondo**: #FFFFFF
- **Texto**: #000000

## 🛠️ Tecnologías

### Backend
- Python 3.11+
- Django 5.0
- Django REST Framework
- PostgreSQL/SQLite

### Frontend
- React 18
- Tailwind CSS
- Axios
- React Router

## 📦 Instalación

### Backend (Django)
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend (React)
```bash
cd frontend
npm install
npm start
```

## 👥 Usuarios

### Administrador
- Acceso completo al sistema
- Gestión de usuarios
- Reportes y estadísticas
- Configuración del sistema

### Empleado
- Gestión de órdenes
- Consulta de stock
- Registro de entregas

## 📱 Acceso

El sistema estará disponible en:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api/

## 📄 Licencia

Propiedad de PuntoTecno © 2026
