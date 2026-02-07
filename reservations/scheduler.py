from apscheduler.schedulers.background import BackgroundScheduler
from django.utils import timezone
from .models import Reservation


def update_completed_reservations():
    today = timezone.now().date()
    Reservation.objects.filter(
        check_out__lt=today,
        status__in=[
            Reservation.ReservationStatus.PENDING,
            Reservation.ReservationStatus.CONFIRMED
        ]
    ).update(status=Reservation.ReservationStatus.COMPLETED)
    
    
def start():
    scheduler = BackgroundScheduler()
    scheduler.add_job(
        update_completed_reservations, 
        'cron',
        hour=11, minute=0
    )
    scheduler.start()