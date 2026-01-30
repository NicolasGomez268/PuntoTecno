"""
Script para crear datos de prueba masivos para testear paginación
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from orders.models import Customer, RepairOrder
from inventory.models import Category, Product
from sales.models import Sale, SaleItem
from decimal import Decimal
import random
from datetime import datetime, timedelta

User = get_user_model()

class Command(BaseCommand):
    help = 'Crea datos de prueba masivos para testear paginación'

    def add_arguments(self, parser):
        parser.add_argument(
            '--customers',
            type=int,
            default=100,
            help='Número de clientes a crear'
        )
        parser.add_argument(
            '--products',
            type=int,
            default=100,
            help='Número de productos a crear'
        )
        parser.add_argument(
            '--orders',
            type=int,
            default=100,
            help='Número de órdenes a crear'
        )
        parser.add_argument(
            '--sales',
            type=int,
            default=100,
            help='Número de ventas a crear'
        )

    def handle(self, *args, **options):
        self.stdout.write('🚀 Creando datos de prueba para paginación...\n')

        # Obtener usuario empleado
        employee = User.objects.filter(role='employee').first()
        if not employee:
            employee = User.objects.create_user(
                username='empleado_test',
                password='test123',
                first_name='Empleado',
                last_name='Test',
                email='empleado@test.com',
                role='employee'
            )
            self.stdout.write(self.style.SUCCESS('✅ Usuario empleado creado'))

        # Crear clientes
        customers_count = options['customers']
        self.create_customers(customers_count)
        
        # Crear productos
        products_count = options['products']
        self.create_products(products_count)
        
        # Crear órdenes
        orders_count = options['orders']
        self.create_orders(orders_count, employee)
        
        # Crear ventas
        sales_count = options['sales']
        self.create_sales(sales_count, employee)
        
        self.stdout.write(self.style.SUCCESS('\n✅ Datos de prueba creados exitosamente!'))
        self.stdout.write('\n📋 Resumen:')
        self.stdout.write(f'  - Clientes: {Customer.objects.count()}')
        self.stdout.write(f'  - Productos: {Product.objects.count()}')
        self.stdout.write(f'  - Órdenes: {RepairOrder.objects.count()}')
        self.stdout.write(f'  - Ventas: {Sale.objects.count()}')

    def create_customers(self, count):
        """Crear clientes de prueba"""
        self.stdout.write(f'📝 Creando {count} clientes...')
        
        nombres = ['Juan', 'María', 'Carlos', 'Ana', 'Luis', 'Laura', 'Pedro', 'Sofia', 'Diego', 'Valentina']
        apellidos = ['González', 'Rodríguez', 'Martínez', 'García', 'López', 'Pérez', 'Sánchez', 'Romero', 'Fernández', 'Torres']
        
        customers = []
        for i in range(count):
            nombre = random.choice(nombres)
            apellido = random.choice(apellidos)
            dni = f'{20000000 + i:08d}'
            
            customer = Customer(
                dni=dni,
                first_name=nombre,
                last_name=apellido,
                phone=f'11{random.randint(10000000, 99999999)}',
                email=f'{nombre.lower()}.{apellido.lower()}{i}@test.com',
                address=f'Calle {random.randint(100, 9999)}, CABA',
                customer_number=f'C-{i+1:05d}'
            )
            customers.append(customer)
        
        Customer.objects.bulk_create(customers, ignore_conflicts=True)
        self.stdout.write(self.style.SUCCESS(f'  ✅ {count} clientes creados'))

    def create_products(self, count):
        """Crear productos de prueba"""
        self.stdout.write(f'📦 Creando {count} productos...')
        
        # Crear categoría si no existe
        category, _ = Category.objects.get_or_create(
            name='Test',
            defaults={'description': 'Productos de prueba'}
        )
        
        tipos = ['Batería', 'Cargador', 'Cable', 'Funda', 'Auriculares', 'Protector', 'Soporte', 'Adaptador']
        marcas = ['Samsung', 'Motorola', 'Xiaomi', 'Apple', 'Huawei', 'LG', 'Nokia', 'Sony']
        
        products = []
        for i in range(count):
            tipo = random.choice(tipos)
            marca = random.choice(marcas)
            
            product = Product(
                sku=f'TEST-{i+1:05d}',
                name=f'{tipo} {marca} Test {i+1}',
                description=f'Producto de prueba número {i+1}',
                category=category,
                unit_price=Decimal(random.randint(100, 5000)),
                sale_price=Decimal(random.randint(200, 10000)),
                quantity=random.randint(0, 100),
                min_stock=5
            )
            products.append(product)
        
        Product.objects.bulk_create(products, ignore_conflicts=True)
        self.stdout.write(self.style.SUCCESS(f'  ✅ {count} productos creados'))

    def create_orders(self, count, employee):
        """Crear órdenes de prueba"""
        self.stdout.write(f'🔧 Creando {count} órdenes...')
        
        customers = list(Customer.objects.all())
        if not customers:
            self.stdout.write(self.style.WARNING('  ⚠️ No hay clientes, creando algunos...'))
            self.create_customers(20)
            customers = list(Customer.objects.all())
        
        device_types = ['Smartphone', 'Tablet', 'Laptop', 'Smartwatch']
        brands = ['Samsung', 'Motorola', 'iPhone', 'Xiaomi', 'Huawei']
        models = ['Galaxy S21', 'G60', '13 Pro', 'Redmi Note', 'P40', 'Galaxy A52', 'E7 Plus']
        problems = [
            'No enciende',
            'Pantalla rota',
            'No carga',
            'Problema de batería',
            'Cámara no funciona',
            'Altavoz no suena',
            'Táctil no responde'
        ]
        statuses = ['received', 'in_service', 'ready', 'repaired', 'delivered']
        
        orders = []
        for i in range(count):
            customer = random.choice(customers)
            status = random.choice(statuses)
            
            # Fecha aleatoria en los últimos 60 días
            days_ago = random.randint(0, 60)
            received_date = datetime.now() - timedelta(days=days_ago)
            
            order = RepairOrder(
                order_number=f'ORD-{RepairOrder.objects.count() + i + 1:06d}',
                customer=customer,
                device_type='phone',
                device_brand=random.choice(brands),
                device_model=random.choice(models),
                device_serial=f'SN{random.randint(100000, 999999)}',
                problem_description=random.choice(problems),
                status=status,
                estimated_cost=Decimal(random.randint(1000, 20000)),
                received_date=received_date,
                assigned_to=employee
            )
            orders.append(order)
        
        RepairOrder.objects.bulk_create(orders)
        self.stdout.write(self.style.SUCCESS(f'  ✅ {count} órdenes creadas'))

    def create_sales(self, count, employee):
        """Crear ventas de prueba"""
        self.stdout.write(f'💰 Creando {count} ventas...')
        
        customers = list(Customer.objects.all())
        products = list(Product.objects.all())
        
        if not customers:
            self.stdout.write(self.style.WARNING('  ⚠️ No hay clientes, creando algunos...'))
            self.create_customers(20)
            customers = list(Customer.objects.all())
        
        if not products:
            self.stdout.write(self.style.WARNING('  ⚠️ No hay productos, creando algunos...'))
            self.create_products(50)
            products = list(Product.objects.all())
        
        payment_methods = ['cash', 'card', 'transfer', 'account']
        
        for i in range(count):
            customer = random.choice(customers) if random.random() > 0.3 else None
            payment_method = random.choice(payment_methods)
            
            # Fecha aleatoria en los últimos 90 días
            days_ago = random.randint(0, 90)
            sale_date = datetime.now() - timedelta(days=days_ago)
            
            # Crear venta
            sale = Sale.objects.create(
                sale_number=f'V-{Sale.objects.count() + i + 1:06d}',
                customer=customer,
                customer_name=f'{customer.first_name} {customer.last_name}' if customer else f'Cliente Anónimo {i}',
                employee=employee,
                payment_method=payment_method,
                discount=Decimal(random.randint(0, 1000)),
                date=sale_date
            )
            
            # Agregar items (1-5 productos por venta)
            num_items = random.randint(1, 5)
            selected_products = random.sample(products, min(num_items, len(products)))
            
            total = Decimal('0')
            for product in selected_products:
                quantity = random.randint(1, 3)
                unit_price = product.sale_price
                
                SaleItem.objects.create(
                    sale=sale,
                    product=product,
                    quantity=quantity,
                    unit_price=unit_price
                )
                total += unit_price * quantity
            
            # Actualizar total de la venta
            sale.subtotal = total
            sale.total = total - sale.discount
            
            # Para cuenta corriente
            if payment_method == 'account':
                paid = Decimal(random.randint(0, int(sale.total)))
                sale.paid_amount = paid
                sale.balance = sale.total - paid
                if paid == 0:
                    sale.payment_status = 'pending'
                elif paid < sale.total:
                    sale.payment_status = 'partial'
                else:
                    sale.payment_status = 'paid'
            
            sale.save()
        
        self.stdout.write(self.style.SUCCESS(f'  ✅ {count} ventas creadas'))
