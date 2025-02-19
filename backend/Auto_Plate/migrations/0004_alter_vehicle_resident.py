# Generated by Django 5.1.3 on 2025-01-08 12:17

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("Auto_Plate", "0003_vehicle_parking_lot"),
    ]

    operations = [
        migrations.AlterField(
            model_name="vehicle",
            name="resident",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="vehicles",
                to="Auto_Plate.resident",
            ),
        ),
    ]
