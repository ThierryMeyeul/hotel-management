from django.db import models
from django.conf import settings
from hotels.models import Room


User = settings.AUTH_USER_MODEL


class Reservation(models.Model):
    
    class ReservationStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        CONFIRMED = 'CONFIRMED', 'Confirmed'
        CANCELLED = 'CANCELLED', 'Cancelled'
        COMPLETED = 'COMPLETED', 'Completed'
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reservations')
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='reservations')
    check_in = models.DateField()
    check_out = models.DateField()
    status = models.CharField(
        max_length=10,
        choices=ReservationStatus.choices,
        default=ReservationStatus.PENDING
    )
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    hotel_name = models.CharField(max_length=20, null=True, blank=True)

    def __str__(self):
        return f"Reservation by {self.user} for {self.room} from {self.check_in} to {self.check_out}"