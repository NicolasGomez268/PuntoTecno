# Generated migration for adding account/credit fields to Sale model

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('sales', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='sale',
            name='payment_status',
            field=models.CharField(
                choices=[('paid', 'Pagado'), ('partial', 'Pago Parcial'), ('pending', 'Pendiente')],
                default='paid',
                max_length=20,
                verbose_name='Estado de Pago'
            ),
        ),
        migrations.AddField(
            model_name='sale',
            name='paid_amount',
            field=models.DecimalField(
                decimal_places=2,
                default=0,
                max_digits=10,
                verbose_name='Monto Pagado'
            ),
        ),
        migrations.AddField(
            model_name='sale',
            name='balance',
            field=models.DecimalField(
                decimal_places=2,
                default=0,
                max_digits=10,
                verbose_name='Saldo Pendiente'
            ),
        ),
        migrations.AlterField(
            model_name='sale',
            name='payment_method',
            field=models.CharField(
                choices=[
                    ('cash', 'Efectivo'),
                    ('card', 'Tarjeta'),
                    ('transfer', 'Transferencia'),
                    ('multiple', 'Múltiple'),
                    ('account', 'Cuenta Corriente')
                ],
                default='cash',
                max_length=20,
                verbose_name='Método de Pago'
            ),
        ),
    ]
