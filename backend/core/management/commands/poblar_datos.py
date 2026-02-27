"""
Comando para poblar la base de datos con datos masivos de prueba.
Crea clientes, repuestos, órdenes de reparación y ventas.
"""
import random
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from orders.models import Customer, RepairOrder, OrderPart
from inventory.models import Category, Product
from sales.models import Sale, SaleItem

User = get_user_model()

# ---------------------------------------------------------------------------
# Datos de muestra
# ---------------------------------------------------------------------------

NOMBRES = [
    'Lucas', 'Valentina', 'Mateo', 'Camila', 'Nicolás', 'Sofía', 'Agustín',
    'Florencia', 'Facundo', 'Martina', 'Sebastián', 'Lucía', 'Tomás', 'Julia',
    'Rodrigo', 'Paula', 'Ignacio', 'Natalia', 'Diego', 'Carolina', 'Leandro',
    'Antonella', 'Pablo', 'Milagros', 'Maximiliano', 'Jimena', 'Gonzalo',
    'Valeria', 'Federico', 'Daniela',
]

APELLIDOS = [
    'González', 'Rodríguez', 'Fernández', 'López', 'Martínez', 'Gómez',
    'Pérez', 'Díaz', 'Torres', 'Ramírez', 'Flores', 'Romero', 'García',
    'Herrera', 'Medina', 'Ruiz', 'Moreno', 'Silva', 'Castro', 'Ortega',
    'Rojas', 'Vargas', 'Alvarez', 'Molina', 'Suárez', 'Vega', 'Soto',
    'Miranda', 'Rios', 'Acosta',
]

REPUESTOS = [
    # (nombre, categoría, precio_costo, precio_venta, stock)
    ('Pantalla Samsung A54', 'Pantallas', 15000, 22000, 8),
    ('Pantalla Samsung A34', 'Pantallas', 12000, 18000, 5),
    ('Pantalla Samsung A14', 'Pantallas', 9000, 14000, 10),
    ('Pantalla iPhone 13', 'Pantallas', 25000, 35000, 4),
    ('Pantalla iPhone 12', 'Pantallas', 22000, 32000, 6),
    ('Pantalla iPhone 11', 'Pantallas', 18000, 27000, 7),
    ('Pantalla Motorola G84', 'Pantallas', 11000, 17000, 9),
    ('Pantalla Motorola G54', 'Pantallas', 10000, 15000, 12),
    ('Pantalla Xiaomi Redmi Note 12', 'Pantallas', 10500, 16000, 8),
    ('Pantalla Xiaomi 13T', 'Pantallas', 19000, 28000, 3),

    ('Batería Samsung A54', 'Baterías', 4000, 7000, 15),
    ('Batería Samsung A34', 'Baterías', 3500, 6000, 18),
    ('Batería iPhone 13', 'Baterías', 6000, 10000, 10),
    ('Batería iPhone 12', 'Baterías', 5500, 9000, 12),
    ('Batería iPhone 11', 'Baterías', 5000, 8500, 14),
    ('Batería Motorola G84', 'Baterías', 3200, 5500, 20),
    ('Batería Xiaomi Redmi Note 12', 'Baterías', 3000, 5000, 16),

    ('Conector de carga Samsung tipo C', 'Conectores', 1500, 3000, 25),
    ('Conector de carga iPhone Lightning', 'Conectores', 2000, 4000, 20),
    ('Conector de carga Motorola tipo C', 'Conectores', 1400, 2800, 22),
    ('Conector de carga Xiaomi tipo C', 'Conectores', 1400, 2800, 25),

    ('Cámara trasera Samsung A54', 'Cámaras', 7000, 12000, 6),
    ('Cámara trasera iPhone 13', 'Cámaras', 12000, 20000, 4),
    ('Cámara trasera Motorola G84', 'Cámaras', 5500, 9500, 7),
    ('Cámara frontal Samsung A54', 'Cámaras', 3500, 6000, 8),
    ('Cámara frontal iPhone 12', 'Cámaras', 5000, 8500, 5),

    ('Tapa trasera Samsung A54', 'Tapas y Carcasas', 2000, 4000, 20),
    ('Tapa trasera iPhone 13 negra', 'Tapas y Carcasas', 3500, 6500, 10),
    ('Marco Samsung A34', 'Tapas y Carcasas', 2500, 5000, 8),
    ('Carcasa completa Motorola G84', 'Tapas y Carcasas', 4000, 7500, 6),

    ('Altavoz Samsung A series', 'Audio', 1800, 3500, 15),
    ('Altavoz iPhone 11/12/13', 'Audio', 2200, 4200, 12),
    ('Parlante inferior Samsung A54', 'Audio', 2000, 3800, 14),
    ('Auricular receptor iPhone', 'Audio', 1500, 3000, 18),

    ('Botón home Samsung', 'Botones', 1000, 2200, 20),
    ('Botón power iPhone 13', 'Botones', 1200, 2500, 15),
    ('Botón volumen Samsung A54', 'Botones', 900, 2000, 18),
    ('Flex botones laterales Xiaomi Note 12', 'Botones', 1100, 2300, 12),

    ('Adhesivo pantalla universal 3M', 'Insumos', 300, 800, 50),
    ('Pasta térmica procesador', 'Insumos', 500, 1200, 30),
    ('Limpiador ultrasónico 500ml', 'Insumos', 1500, 3500, 10),
    ('Alcohol isopropílico 99% 500ml', 'Insumos', 800, 2000, 20),
]

PROBLEMAS = [
    'Pantalla rota, no enciende',
    'Se cayó al agua, no carga',
    'Batería inflamada no dura nada',
    'Pantalla con manchas y táctil falla',
    'No carga, conector dañado',
    'Cámara trasera no funciona, imagen borrosa',
    'Altavoz no suena, solo vibra',
    'Botón de encendido no responde',
    'Tapa trasera rota',
    'Sin señal, antena dañada',
    'Pantalla negra pero vibra',
    'Se apaga solo a los 30%',
    'Pantalla parpadeante',
    'WiFi no conecta',
    'Micrófono no funciona en llamadas',
]

DIAGNOSTICOS = [
    'Pantalla dañada por golpe, requiere reemplazo completo del módulo',
    'Corrosión por humedad en placa, requiere limpieza ultrasónica y reemplazo de batería',
    'Batería hinchada con 80% de capacidad reducida, reemplazo necesario',
    'Módulo de pantalla defectuoso, calibración de táctil fallida',
    'Pin del conector doblado tipo C, reemplazo del flex de carga',
    'Sensor de cámara dañado, módulo completo a reemplazar',
    'Bobina del altavoz quemada, reemplazo de parlante',
    'Flex de botón lateral roto',
    'Cristal trasero fisurado, sin daño en internos',
    'Antena GSM desconectada internamente',
]

MARCAS_MODELOS = [
    ('phone', 'Samsung', 'Galaxy A54'),
    ('phone', 'Samsung', 'Galaxy A34'),
    ('phone', 'Samsung', 'Galaxy A14'),
    ('phone', 'Samsung', 'Galaxy S23'),
    ('phone', 'iPhone', 'iPhone 13'),
    ('phone', 'iPhone', 'iPhone 12'),
    ('phone', 'iPhone', 'iPhone 11'),
    ('phone', 'Motorola', 'Moto G84'),
    ('phone', 'Motorola', 'Moto G54'),
    ('phone', 'Xiaomi', 'Redmi Note 12'),
    ('phone', 'Xiaomi', '13T'),
    ('tablet', 'Samsung', 'Galaxy Tab A8'),
    ('tablet', 'iPad', 'iPad 9'),
    ('laptop', 'Lenovo', 'IdeaPad 3'),
    ('laptop', 'HP', 'Pavilion 15'),
]

COLORES = ['Negro', 'Blanco', 'Azul', 'Verde', 'Rojo', 'Gris', 'Dorado', 'Rosa']
ESTADOS = ['received', 'in_service', 'repaired', 'ready', 'delivered', 'cancelled']
PAGOS_ORDEN = ['cash', 'transfer', 'not_paid', 'account']
PAGOS_VENTA = ['cash', 'card', 'transfer']


class Command(BaseCommand):
    help = 'Pobla la base de datos con datos masivos de prueba'

    def add_arguments(self, parser):
        parser.add_argument('--clientes', type=int, default=30, help='Cantidad de clientes a crear')
        parser.add_argument('--ordenes', type=int, default=50, help='Cantidad de órdenes a crear')
        parser.add_argument('--ventas', type=int, default=40, help='Cantidad de ventas a crear')
        parser.add_argument('--limpiar', action='store_true', help='Eliminar datos de prueba existentes antes de crear')

    def handle(self, *args, **options):
        if options['limpiar']:
            self.limpiar_datos()

        self.stdout.write(self.style.HTTP_INFO('\n🚀 Poblando base de datos con datos de prueba...\n'))

        admin = self.get_or_create_admin()
        categorias = self.crear_categorias()
        productos = self.crear_productos(categorias)
        clientes = self.crear_clientes(options['clientes'])
        ordenes = self.crear_ordenes(clientes, productos, admin, options['ordenes'])
        ventas = self.crear_ventas(clientes, productos, admin, options['ventas'])

        self.stdout.write(self.style.SUCCESS('\n✅ Datos de prueba creados exitosamente!\n'))
        self.stdout.write(f'   👤 Clientes:   {len(clientes)} creados ({Customer.objects.count()} total)')
        self.stdout.write(f'   📦 Repuestos:  {len(productos)} creados ({Product.objects.count()} total)')
        self.stdout.write(f'   🔧 Órdenes:    {len(ordenes)} creadas ({RepairOrder.objects.count()} total)')
        self.stdout.write(f'   🛒 Ventas:     {len(ventas)} creadas ({Sale.objects.count()} total)\n')
        self.stdout.write('   🔑 Admin: usuario=admin  contraseña=admin123\n')

    # ------------------------------------------------------------------
    def limpiar_datos(self):
        self.stdout.write(self.style.WARNING('🗑  Limpiando datos de prueba...'))
        SaleItem.objects.all().delete()
        Sale.objects.all().delete()
        try:
            OrderPart.objects.all().delete()
        except Exception:
            pass
        RepairOrder.objects.all().delete()
        Customer.objects.all().delete()
        Product.objects.all().delete()
        Category.objects.all().delete()
        self.stdout.write(self.style.WARNING('   Listo.\n'))

    def get_or_create_admin(self):
        user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@puntotecno.com',
                'first_name': 'Administrador',
                'last_name': 'PuntoTecno',
                'role': 'admin',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        if created:
            user.set_password('admin123')
            user.save()
            self.stdout.write('   ✓ Usuario admin creado')
        return user

    # ------------------------------------------------------------------
    def crear_categorias(self):
        nombres = list({r[1] for r in REPUESTOS})  # únicos
        categorias = {}
        for nombre in nombres:
            cat, _ = Category.objects.get_or_create(name=nombre)
            categorias[nombre] = cat
        self.stdout.write(f'   ✓ {len(categorias)} categorías listas')
        return categorias

    def crear_productos(self, categorias):
        creados = []
        for idx, (nombre, cat_nombre, costo, venta, stock) in enumerate(REPUESTOS, start=1):
            sku = f'REP-{idx:04d}'
            prod, created = Product.objects.get_or_create(
                sku=sku,
                defaults={
                    'category': categorias[cat_nombre],
                    'name': nombre,
                    'unit_price': Decimal(costo),
                    'sale_price': Decimal(venta),
                    'quantity': stock,
                    'min_stock': 3,
                    'is_active': True,
                }
            )
            creados.append(prod)
        self.stdout.write(f'   ✓ {len(creados)} repuestos/productos listos')
        return creados

    # ------------------------------------------------------------------
    def crear_clientes(self, cantidad):
        creados = []
        usados_dni = set(Customer.objects.values_list('dni', flat=True))
        intentos = 0
        while len(creados) < cantidad and intentos < cantidad * 3:
            intentos += 1
            dni = str(random.randint(20_000_000, 45_000_000))
            if dni in usados_dni:
                continue
            usados_dni.add(dni)
            nombre = random.choice(NOMBRES)
            apellido = random.choice(APELLIDOS)
            cliente = Customer.objects.create(
                dni=dni,
                first_name=nombre,
                last_name=apellido,
                phone=f'11{random.randint(10000000, 99999999)}',
                email=f'{nombre.lower()}.{apellido.lower()}{random.randint(1,99)}@mail.com',
                address=f'Calle {random.choice(APELLIDOS)} {random.randint(100, 9999)}, Bahía Blanca',
            )
            creados.append(cliente)
        self.stdout.write(f'   ✓ {len(creados)} clientes creados')
        return creados

    # ------------------------------------------------------------------
    def crear_ordenes(self, clientes, productos, admin, cantidad):
        creados = []

        for i in range(cantidad):
            cliente = random.choice(clientes)
            dispositivo = random.choice(MARCAS_MODELOS)
            estado = random.choice(ESTADOS)
            costo_estimado = Decimal(random.choice([5000, 8000, 10000, 15000, 20000, 25000, 30000]))
            costo_final = costo_estimado + Decimal(random.randint(-2000, 5000)) if estado in ('repaired', 'ready', 'delivered') else None
            deposito = Decimal(random.choice([0, 2000, 5000, 10000]))
            metodo_pago = random.choice(PAGOS_ORDEN)

            repuestos_usados = random.sample(productos[:20], random.randint(0, 3))
            parts_cost = sum(p.unit_price for p in repuestos_usados)

            orden = RepairOrder.objects.create(
                customer=cliente,
                device_type=dispositivo[0],
                device_brand=dispositivo[1],
                device_model=dispositivo[2],
                device_color=random.choice(COLORES),
                device_serial=f'SN{random.randint(100000000, 999999999)}',
                problem_description=random.choice(PROBLEMAS),
                diagnosis=random.choice(DIAGNOSTICOS) if estado != 'received' else '',
                status=estado,
                estimated_cost=costo_estimado,
                final_cost=costo_final,
                deposit_amount=deposito,
                parts_cost=parts_cost,
                payment_method=metodo_pago,
                assigned_to=admin,
                created_by=admin,
            )

            # Agregar repuestos a la orden si el modelo OrderPart existe
            try:
                for prod in repuestos_usados:
                    qty = random.randint(1, 2)
                    OrderPart.objects.create(
                        order=orden,
                        product=prod,
                        quantity=qty,
                        unit_price=prod.unit_price,
                        subtotal=prod.unit_price * qty,
                    )
            except Exception:
                pass

            creados.append(orden)

        self.stdout.write(f'   ✓ {len(creados)} órdenes creadas')
        return creados

    # ------------------------------------------------------------------
    def crear_ventas(self, clientes, productos, admin, cantidad):
        creados = []
        existing_numbers = set(Sale.objects.values_list('sale_number', flat=True))

        for i in range(cantidad):
            num = 1000 + Sale.objects.count() + i + 1
            sale_number = f'VTA-{num:05d}'
            if sale_number in existing_numbers:
                sale_number = f'VTA-{random.randint(90000, 99999)}'
            existing_numbers.add(sale_number)

            cliente = random.choice(clientes + [None] * 10)  # algunas sin cliente
            metodo = random.choice(PAGOS_VENTA)
            descuento = Decimal(random.choice([0, 0, 0, 500, 1000, 2000]))

            venta = Sale.objects.create(
                sale_number=sale_number,
                customer=cliente if isinstance(cliente, Customer) else None,
                customer_name='' if isinstance(cliente, Customer) else 'Cliente Ocasional',
                payment_method=metodo,
                payment_status='paid',
                discount=descuento,
                subtotal=Decimal('0'),
                total=Decimal('0'),
                paid_amount=Decimal('0'),
                balance=Decimal('0'),
                employee=admin,
            )

            # Agregar 1-5 productos al ticket
            items_productos = random.sample(productos, random.randint(1, 5))
            subtotal_total = Decimal('0')
            for prod in items_productos:
                qty = random.randint(1, 3)
                precio = prod.sale_price
                subtotal = precio * qty
                SaleItem.objects.create(
                    sale=venta,
                    product=prod,
                    quantity=qty,
                    unit_price=precio,
                    subtotal=subtotal,
                )
                subtotal_total += subtotal

            total = subtotal_total - descuento
            venta.subtotal = subtotal_total
            venta.total = total
            venta.paid_amount = total
            venta.save()

            creados.append(venta)

        self.stdout.write(f'   ✓ {len(creados)} ventas creadas')
        return creados
