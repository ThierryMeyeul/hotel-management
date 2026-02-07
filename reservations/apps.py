from django.apps import AppConfig


class ReservationsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'reservations'

    def ready(self):
        import os

        # Empêche double lancement en DEBUG
        if os.environ.get('RUN_MAIN') != 'true':
            return

        from .scheduler import start
        start()
