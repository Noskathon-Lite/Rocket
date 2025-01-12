from django.apps import AppConfig


class AutoPlateConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'Auto_Plate'

    def ready(self):
        import Auto_Plate.signals
