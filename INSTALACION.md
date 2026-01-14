# 🚀 Guía de Instalación - PuntoTecno

## ⚙️ Configuración del Backend (Django)

### 1. Crear entorno virtual
```bash
cd backend
python -m venv venv
```

### 2. Activar entorno virtual
**Windows:**
```bash
venv\Scripts\activate
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

### 3. Instalar dependencias
```bash
pip install -r requirements.txt
```

### 4. Configurar base de datos
```bash
python manage.py makemigrations
python manage.py migrate
```

### 5. Crear superusuario
```bash
python manage.py createsuperuser
```
- Username: admin
- Email: admin@puntotecno.com
- Password: admin123
- Role: admin

### 6. Cargar datos de ejemplo (OPCIONAL)
```bash
python manage.py create_sample_data
```

Este comando creará:
- 👤 2 usuarios (admin y técnico)
- 👥 3 clientes de ejemplo
- 💼 5 servicios predefinidos
- 📦 4 productos en inventario
- 📋 3 órdenes de reparación de ejemplo

**Usuarios creados:**
- Admin: `admin` / `admin123`
- Técnico: `tecnico1` / `tecnico123`

### 7. Iniciar servidor Django
```bash
python manage.py runserver
```

Backend disponible en: **http://localhost:8000**

---

## 🎨 Configuración del Frontend (React)

### 1. Instalar Node.js y npm
Descarga e instala desde: https://nodejs.org/

### 2. Instalar dependencias
```bash
cd frontend
npm install
```

### 3. Iniciar servidor de desarrollo
```bash
npm start
```

Frontend disponible en: **http://localhost:3000**

---

## 📝 Datos de Acceso

### Administrador:
- Usuario: `admin`
- Contraseña: `admin123`
- Rol: Administrador (acceso total)

### Técnico:
- Usuario: `tecnico1`
- Contraseña: `tecnico123`
- Rol: Empleado (órdenes asignadas)

---

## 🔧 Verificación de la Instalación

1. ✅ Backend: http://localhost:8000/admin/
2. ✅ API: http://localhost:8000/api/
3. ✅ Frontend: http://localhost:3000/login

---

## 🐛 Solución de Problemas

### Error: Module not found
```bash
# Backend
pip install -r requirements.txt

# Frontend
npm install
```

### Error: Port already in use
```bash
# Cambiar puerto del backend
python manage.py runserver 8001

# Cambiar puerto del frontend (crear archivo .env)
PORT=3001
```

### Error: CORS
Verificar que en `settings.py` esté configurado:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
]
```

---

### 🔄 Flujo de Trabajo Recomendado:

1. **Registrar Clientes Primero**
   - Ir a "Clientes"
   - Agregar DNI, nombre, teléfono
   - Guardar cliente

2. **Crear Orden de Reparación**
   - Ir a "Órdenes" → "Nueva Orden"
   - Seleccionar cliente existente
   - Agregar datos del equipo (marca, modelo, color)
   - Agregar datos de seguridad (opcional)
   - Describir el problema
   - Guardar orden

3. **Gestionar el Servicio**
   - Ver "Dashboard" para órdenes pendientes
   - Cambiar estado: Recibido → En Servicio → Reparado/No Reparado
   - Agregar diagnóstico y notas
   - Marcar como "Listo para Entrega"

4. **Entregar Equipo**
   - Cambiar estado a "Entregado"
   - Registrar pago (Efectivo/Transferencia)
   - Generar recibo (próximamente)

### 📋 Configuración Inicial:

1. **Crear Categorías de Inventario**
   - Pantallas
   - Baterías
   - Tapas
   - Accesorios

2. **Agregar Productos**
   - Definir stock mínimo
   - Establecer precios

3. **Crear Servicios/Presupuestos**
   - Ejemplo: "Cambio Pantalla Samsung A53 - $15,000"
   - Definir tiempos estimadotes
4. Crear órdenes de reparación
5. Generar reportes

---

## 🆘 Soporte

Para dudas o problemas:
- Revisar la documentación en `README.md`
- Verificar logs del backend en la terminal
- Verificar logs del frontend en la consola del navegador
