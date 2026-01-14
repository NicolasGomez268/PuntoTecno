# 🔄 MIGRACIONES NECESARIAS - CAMBIOS IMPORTANTES

## ⚠️ IMPORTANTE: Leer antes de ejecutar

Se han realizado cambios significativos en los modelos de la base de datos para adaptarse al flujo de trabajo del sistema anterior.

## 📋 Cambios Realizados

### 1. **Modelo Customer (Clientes)**
- ✅ Agregado campo `dni` (obligatorio, único)
- ✅ Agregado campo `customer_number` (opcional)

### 2. **Modelo RepairOrder (Órdenes)**
- ✅ Agregado campo `device_color` (color del equipo)
- ✅ Agregado campo `security_data` (clave, patrón, PIN)
- ✅ Agregado campo `general_observations` (observaciones generales)
- ✅ Agregado campo `payment_method` (efectivo, transferencia, sin abonar)
- ✅ Actualizados estados: received, in_service, repaired, not_repaired, not_solved, ready, delivered, cancelled

### 3. **Nueva App: Services (Servicios/Presupuestos)**
- ✅ Modelo Service para generar presupuestos
- ✅ Ejemplo: "Reparación pantalla Samsung A53 - $15,000"

## 🚀 Pasos para Migrar

### Si es una instalación nueva:
```bash
cd backend
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

### Si ya tienes datos en la base de datos:

#### Opción 1: Migración automática (puede fallar si hay clientes sin DNI)
```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

#### Opción 2: Empezar de cero (recomendado para desarrollo)
```bash
cd backend
# Eliminar base de datos
del db.sqlite3

# Crear nuevas migraciones
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

#### Opción 3: Migración manual con datos existentes
```bash
# 1. Crear backup de la base de datos actual
copy db.sqlite3 db.sqlite3.backup

# 2. Abrir Django shell
python manage.py shell
```

```python
# 3. Actualizar clientes existentes con DNI temporal
from orders.models import Customer
for i, customer in enumerate(Customer.objects.all(), 1):
    customer.dni = f"TEMP{i:06d}"
    customer.save()
exit()
```

```bash
# 4. Ahora ejecutar migraciones
python manage.py makemigrations
python manage.py migrate
```

## 📝 Crear Datos de Prueba

Después de migrar, puedes crear datos de prueba:

```bash
python manage.py shell
```

```python
from orders.models import Customer, RepairOrder
from core.models import User

# Crear cliente de ejemplo
cliente = Customer.objects.create(
    dni="20123456789",
    customer_number="C001",
    first_name="Daniel",
    last_name="Cisneros",
    phone="+543814408596",
    email="no@posee.com",
    address="S/CALLE 0, SANTIAGO DEL ESTERO"
)

# Crear orden de ejemplo
admin = User.objects.filter(role='admin').first()

orden = RepairOrder.objects.create(
    customer=cliente,
    device_type='phone',
    device_brand='Apple',
    device_model='iPhone 13 Pro',
    device_color='blanco',
    device_serial='R5_607459226',
    security_data='Clave: 1234',
    problem_description='Se debe realizar un cambio de pantalla',
    general_observations='El equipo no enciende',
    status='received',
    estimated_cost=0.00,
    deposit_amount=0.00,
    payment_method='not_paid',
    created_by=admin
)

print(f"✅ Orden creada: {orden.order_number}")

# Crear servicio de ejemplo
from services.models import Service

servicio = Service.objects.create(
    name='Reparación de Pantalla',
    device_brand='Samsung',
    device_model='A53',
    base_price=15000,
    estimated_time='2-3 días',
    description='Cambio completo de pantalla LCD + Touch'
)

print(f"✅ Servicio creado: {servicio}")
exit()
```

## ✅ Verificar que todo funciona

1. **Iniciar backend:**
```bash
python manage.py runserver
```

2. **Verificar en el admin:** http://localhost:8000/admin/
   - Clientes deben tener campo DNI
   - Órdenes deben tener color, datos de seguridad, observaciones
   - Debe aparecer la sección "Servicios"

3. **Iniciar frontend:**
```bash
cd frontend
npm start
```

4. **Acceder:** http://localhost:3000/login

## 🐛 Solución de Problemas

### Error: "NOT NULL constraint failed: orders_customer.dni"
- Todos los clientes deben tener DNI
- Usar la Opción 3 de migración manual

### Error: "No such table: services_service"
- Ejecutar: `python manage.py migrate services`

### Error: "Unknown field(s): device_color"
- Ejecutar: `python manage.py makemigrations orders`
- Luego: `python manage.py migrate orders`

## 📞 Soporte

Si tienes problemas con las migraciones, contacta al desarrollador.
