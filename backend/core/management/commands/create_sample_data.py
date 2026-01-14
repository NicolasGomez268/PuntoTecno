"""
Script para crear datos iniciales de ejemplo
Basado en el recibo de PuntoTecno
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from orders.models import Customer, RepairOrder
from services.models import Service
from inventory.models import Category, Product

User = get_user_model()

class Command(BaseCommand):
    help = 'Crea datos de ejemplo para PuntoTecno'

    def handle(self, *args, **kwargs):
        self.stdout.write('🚀 Creando datos de ejemplo para PuntoTecno...\n')

        # Crear usuarios si no existen
        self.create_users()
        
        # Crear clientes de ejemplo
        self.create_customers()
        
        # Crear servicios de ejemplo
        self.create_services()
        
        # Crear categorías y productos
        self.create_inventory()
        
        # Crear órdenes de ejemplo
        self.create_orders()
        
        self.stdout.write(self.style.SUCCESS('\n✅ Datos de ejemplo creados exitosamente!'))
        self.stdout.write('\n📋 Resumen:')
        self.stdout.write(f'  - Usuarios: {User.objects.count()}')
        self.stdout.write(f'  - Clientes: {Customer.objects.count()}')
        self.stdout.write(f'  - Servicios: {Service.objects.count()}')
        self.stdout.write(f'  - Órdenes: {RepairOrder.objects.count()}')
        self.stdout.write(f'  - Productos: {Product.objects.count()}')

    def create_users(self):
        """Crear usuarios de ejemplo"""
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser(
                username='admin',
                email='admin@puntotecno.com',
                password='admin123',
                first_name='Administrador',
                last_name='PuntoTecno',
                role='admin',
                phone='3841408596'
            )
            self.stdout.write('  ✓ Administrador creado')

        if not User.objects.filter(username='tecnico1').exists():
            User.objects.create_user(
                username='tecnico1',
                email='tecnico@puntotecno.com',
                password='tecnico123',
                first_name='Juan',
                last_name='Pérez',
                role='employee',
                phone='3841234567'
            )
            self.stdout.write('  ✓ Técnico creado')

    def create_customers(self):
        """Crear clientes de ejemplo"""
        customers_data = [
            {
                'dni': '20123456789',
                'customer_number': 'C001',
                'first_name': 'Daniel',
                'last_name': 'Cisneros',
                'phone': '+543814408596',
                'email': 'no@posee.com',
                'address': 'S/CALLE 0, SANTIAGO DEL ESTERO'
            },
            {
                'dni': '27987654321',
                'customer_number': 'C002',
                'first_name': 'María',
                'last_name': 'González',
                'phone': '+543814567890',
                'email': 'maria@email.com',
                'address': 'Av. Belgrano 123'
            },
            {
                'dni': '30456789012',
                'customer_number': 'C003',
                'first_name': 'Carlos',
                'last_name': 'Rodríguez',
                'phone': '+543814111222',
                'email': '',
                'address': ''
            }
        ]

        for data in customers_data:
            customer, created = Customer.objects.get_or_create(
                dni=data['dni'],
                defaults=data
            )
            if created:
                self.stdout.write(f'  ✓ Cliente creado: {customer.get_full_name()}')

    def create_services(self):
        """Crear servicios de ejemplo"""
        services_data = [
            {
                'name': 'Cambio de Pantalla',
                'device_brand': 'Samsung',
                'device_model': 'A53',
                'base_price': 15000,
                'estimated_time': '2-3 días',
                'description': 'Cambio completo de pantalla LCD + Touch'
            },
            {
                'name': 'Cambio de Batería',
                'device_brand': 'iPhone',
                'device_model': '13 Pro',
                'base_price': 12000,
                'estimated_time': '1 día',
                'description': 'Reemplazo de batería original'
            },
            {
                'name': 'Cambio de Tapa Trasera',
                'device_brand': 'Samsung',
                'device_model': 'A53',
                'base_price': 5000,
                'estimated_time': '1 día',
                'description': 'Reemplazo de tapa trasera'
            },
            {
                'name': 'Limpieza de Conector de Carga',
                'device_brand': '',
                'device_model': '',
                'base_price': 2000,
                'estimated_time': '30 minutos',
                'description': 'Limpieza profunda del conector'
            },
            {
                'name': 'Cambio de Táctil',
                'device_brand': 'Motorola',
                'device_model': 'G52',
                'base_price': 8000,
                'estimated_time': '2 días',
                'description': 'Reemplazo de vidrio táctil'
            }
        ]

        for data in services_data:
            service, created = Service.objects.get_or_create(
                name=data['name'],
                device_brand=data['device_brand'],
                device_model=data['device_model'],
                defaults=data
            )
            if created:
                self.stdout.write(f'  ✓ Servicio creado: {service}')

    def create_inventory(self):
        """Crear categorías y productos de ejemplo"""
        # Categorías
        categories_data = [
            {'name': 'Pantallas', 'description': 'Pantallas LCD y OLED para celulares'},
            {'name': 'Baterías', 'description': 'Baterías originales y compatibles'},
            {'name': 'Tapas Traseras', 'description': 'Tapas y covers traseros'},
            {'name': 'Cargadores', 'description': 'Cargadores y cables'},
            {'name': 'Auriculares', 'description': 'Auriculares y accesorios de audio'},
        ]

        for cat_data in categories_data:
            category, created = Category.objects.get_or_create(
                name=cat_data['name'],
                defaults=cat_data
            )
            if created:
                self.stdout.write(f'  ✓ Categoría creada: {category.name}')

        # Productos
        pantallas = Category.objects.get(name='Pantallas')
        baterias = Category.objects.get(name='Baterías')
        tapas = Category.objects.get(name='Tapas Traseras')

        products_data = [
            {
                'category': pantallas,
                'name': 'Pantalla Samsung A53',
                'sku': 'PAN-SAM-A53',
                'quantity': 5,
                'min_stock': 2,
                'unit_price': 12000,
                'sale_price': 15000
            },
            {
                'category': baterias,
                'name': 'Batería iPhone 13 Pro',
                'sku': 'BAT-IPH-13P',
                'quantity': 8,
                'min_stock': 3,
                'unit_price': 9000,
                'sale_price': 12000
            },
            {
                'category': tapas,
                'name': 'Tapa Trasera Samsung A53',
                'sku': 'TAP-SAM-A53',
                'quantity': 3,
                'min_stock': 2,
                'unit_price': 3500,
                'sale_price': 5000
            },
            {
                'category': pantallas,
                'name': 'Pantalla Motorola G52',
                'sku': 'PAN-MOT-G52',
                'quantity': 1,
                'min_stock': 2,
                'unit_price': 6000,
                'sale_price': 8000
            }
        ]

        for prod_data in products_data:
            product, created = Product.objects.get_or_create(
                sku=prod_data['sku'],
                defaults=prod_data
            )
            if created:
                self.stdout.write(f'  ✓ Producto creado: {product.name}')

    def create_orders(self):
        """Crear órdenes de ejemplo"""
        admin = User.objects.filter(role='admin').first()
        tecnico = User.objects.filter(role='employee').first()
        
        # Orden 1: Basada en el recibo mostrado
        cliente1 = Customer.objects.get(dni='20123456789')
        
        orden1, created = RepairOrder.objects.get_or_create(
            order_number='ORD-000001',
            defaults={
                'customer': cliente1,
                'device_type': 'phone',
                'device_brand': 'Apple',
                'device_model': 'iPhone 13 Pro',
                'device_color': 'blanco',
                'device_serial': 'R5_607459226',
                'security_data': 'Clave: No especificada',
                'problem_description': 'Se debe realizar un cambio de pantalla',
                'general_observations': 'El equipo no enciende',
                'status': 'received',
                'estimated_cost': 0.00,
                'final_cost': 0.00,
                'deposit_amount': 0.00,
                'payment_method': 'not_paid',
                'created_by': admin,
                'assigned_to': tecnico
            }
        )
        if created:
            self.stdout.write(f'  ✓ Orden creada: {orden1.order_number}')

        # Orden 2: En reparación
        cliente2 = Customer.objects.get(dni='27987654321')
        
        orden2, created = RepairOrder.objects.get_or_create(
            order_number='ORD-000002',
            defaults={
                'customer': cliente2,
                'device_type': 'phone',
                'device_brand': 'Samsung',
                'device_model': 'A53',
                'device_color': 'negro',
                'device_serial': '',
                'security_data': 'Patrón: L invertida',
                'problem_description': 'Pantalla rota',
                'general_observations': 'El táctil funciona parcialmente',
                'status': 'in_service',
                'estimated_cost': 15000,
                'final_cost': 15000,
                'deposit_amount': 5000,
                'payment_method': 'cash',
                'created_by': admin,
                'assigned_to': tecnico
            }
        )
        if created:
            self.stdout.write(f'  ✓ Orden creada: {orden2.order_number}')

        # Orden 3: Lista para entrega
        cliente3 = Customer.objects.get(dni='30456789012')
        
        orden3, created = RepairOrder.objects.get_or_create(
            order_number='ORD-000003',
            defaults={
                'customer': cliente3,
                'device_type': 'phone',
                'device_brand': 'Motorola',
                'device_model': 'G52',
                'device_color': 'azul',
                'device_serial': '',
                'security_data': 'PIN: 1234',
                'problem_description': 'Cambio de batería',
                'general_observations': '',
                'status': 'ready',
                'estimated_cost': 8000,
                'final_cost': 8000,
                'deposit_amount': 8000,
                'payment_method': 'transfer',
                'created_by': admin,
                'assigned_to': tecnico
            }
        )
        if created:
            self.stdout.write(f'  ✓ Orden creada: {orden3.order_number}')
