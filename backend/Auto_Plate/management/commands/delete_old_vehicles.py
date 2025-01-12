from django.core.management.base import BaseCommand
from django.utils.timezone import now
from Auto_Plate.models import Vehicle
from datetime import timedelta

class Command(BaseCommand):
    help = "Deletes non-resident vehicles older than a year"

    def handle(self, *args, **kwargs):
        one_year_ago = now() - timedelta(days=365)
        old_vehicles = Vehicle.objects.filter(is_resident=False, created_at__lte=one_year_ago)
        count = old_vehicles.count()
        old_vehicles.delete()
        self.stdout.write(self.style.SUCCESS(f"Successfully deleted {count} non-resident vehicles older than a year"))
