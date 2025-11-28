from django.db import models

from users.models import User
from hotels.models import Room


class ReservationStatus(models.TextChoices):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    CANCELLED = "CANCELLED"

class PaymentMethod(models.TextChoices):
    ORANGE_MONEY = "ORANGE_MONEY"
    MOBILE_MONEY = "MOBILE_MONEY"
    EXPRESS_UNION = "EXPRESS_UNION"
    

class Reservation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="reservations")
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name="reservations")
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    total_price = models.FloatField()
    status = models.CharField(max_length=20, choices=ReservationStatus.choices)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Reservation {self.id} - {self.user.username}"
    

class Payment(models.Model):
    reservation = models.OneToOneField(Reservation, on_delete=models.CASCADE, related_name="payment")
    price = models.FloatField()
    date = models.DateTimeField(auto_now_add=True)
    method = models.CharField(max_length=20, choices=PaymentMethod.choices)

    def __str__(self):
        return f"Payment {self.id} for Reservation {self.reservation.id}"
