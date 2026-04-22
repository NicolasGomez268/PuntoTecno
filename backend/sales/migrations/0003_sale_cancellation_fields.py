from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('sales', '0002_sale_account_fields'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='sale',
            name='cancelled_at',
            field=models.DateTimeField(blank=True, null=True, verbose_name='Fecha de anulación'),
        ),
        migrations.AddField(
            model_name='sale',
            name='cancelled_by',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='cancelled_sales', to=settings.AUTH_USER_MODEL, verbose_name='Anulada por'),
        ),
        migrations.AddField(
            model_name='sale',
            name='cancellation_reason',
            field=models.TextField(blank=True, verbose_name='Motivo de anulación'),
        ),
        migrations.AddField(
            model_name='sale',
            name='is_cancelled',
            field=models.BooleanField(default=False, verbose_name='Venta anulada'),
        ),
    ]
