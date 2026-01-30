"""
Script para limpiar datos de prueba de la base de datos
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from orders.models import Customer, RepairOrder
from inventory.models import Product, Category
from sales.models import Sale, SaleItem

User = get_user_model()


class Command(BaseCommand):
    help = 'Elimina todos los datos de prueba de la base de datos'

    def add_arguments(self, parser):
        parser.add_argument(
            '--confirm',
            action='store_true',
            help='Confirmar la eliminación de datos'
        )

    def handle(self, *args, **options):
        if not options['confirm']:
            self.stdout.write(
                self.style.WARNING(
                    '⚠️  ADVERTENCIA: Este comando eliminará TODOS los datos de prueba.\n'
                    'Para confirmar, ejecuta: python manage.py clean_test_data --confirm'
                )
            )
            return

        self.stdout.write(self.style.WARNING('\n🧹 Iniciando limpieza de datos de prueba...\n'))

        # Contador de elementos eliminados
        deleted = {
            'sales': 0,
            'sale_items': 0,
            'orders': 0,
            'products': 0,
            'categories': 0,
            'customers': 0,
            'users': 0
        }

        # Eliminar todas las ventas y sus items
        self.stdout.write('  🗑️  Eliminando ventas...')
        deleted['sale_items'] = SaleItem.objects.all().count()
        SaleItem.objects.all().delete()
        deleted['sales'] = Sale.objects.all().count()
        Sale.objects.all().delete()
        self.stdout.write(self.style.SUCCESS(f'    ✅ {deleted["sales"]} ventas eliminadas'))

        # Eliminar todas las órdenes de reparación
        self.stdout.write('  🗑️  Eliminando órdenes de reparación...')
        deleted['orders'] = RepairOrder.objects.all().count()
        RepairOrder.objects.all().delete()
        self.stdout.write(self.style.SUCCESS(f'    ✅ {deleted["orders"]} órdenes eliminadas'))

        # Eliminar todos los productos
        self.stdout.write('  🗑️  Eliminando productos...')
        deleted['products'] = Product.objects.all().count()
        Product.objects.all().delete()
        self.stdout.write(self.style.SUCCESS(f'    ✅ {deleted["products"]} productos eliminados'))

        # Eliminar categorías de prueba
        self.stdout.write('  🗑️  Eliminando categorías de prueba...')
        test_categories = Category.objects.filter(name__in=['Test', 'Prueba'])
        deleted['categories'] = test_categories.count()
        test_categories.delete()
        self.stdout.write(self.style.SUCCESS(f'    ✅ {deleted["categories"]} categorías eliminadas'))

        # Eliminar todos los clientes
        self.stdout.write('  🗑️  Eliminando clientes...')
        deleted['customers'] = Customer.objects.all().count()
        Customer.objects.all().delete()
        self.stdout.write(self.style.SUCCESS(f'    ✅ {deleted["customers"]} clientes eliminados'))

        # Eliminar usuarios de prueba (mantener solo admin)
        self.stdout.write('  🗑️  Eliminando usuarios de prueba...')
        # Mantener solo el primer usuario admin
        admin_user = User.objects.filter(role='admin').first()
        if admin_user:
            test_users = User.objects.exclude(id=admin_user.id)
            deleted['users'] = test_users.count()
            test_users.delete()
            self.stdout.write(self.style.SUCCESS(f'    ✅ {deleted["users"]} usuarios eliminados (admin preservado)'))
        else:
            self.stdout.write(self.style.WARNING('    ⚠️  No se encontró usuario admin, no se eliminaron usuarios'))

        # Resumen
        self.stdout.write(self.style.SUCCESS('\n✅ Limpieza completada exitosamente!\n'))
        self.stdout.write('📋 Resumen:')
        self.stdout.write(f'  - Items de venta: {deleted["sale_items"]}')
        self.stdout.write(f'  - Ventas: {deleted["sales"]}')
        self.stdout.write(f'  - Órdenes: {deleted["orders"]}')
        self.stdout.write(f'  - Productos: {deleted["products"]}')
        self.stdout.write(f'  - Categorías: {deleted["categories"]}')
        self.stdout.write(f'  - Clientes: {deleted["customers"]}')
        self.stdout.write(f'  - Usuarios: {deleted["users"]}')
        self.stdout.write('\n🎉 Base de datos lista para producción!')
