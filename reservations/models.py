from django.db import models
from django.conf import settings
from hotels.models import Room
from payments.models import Payment


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

    def __str__(self):
        return f"Reservation by {self.user} for {self.room} from {self.check_in} to {self.check_out}"
    
    @property
    def payment_info(self):
        """Propriété pour récupérer les infos de paiement associées"""
        try:
            payment = self.payment
            return {
                'id': payment.id,
                'amount': str(payment.amount),
                'payment_date': payment.payment_date,
                'payment_method': payment.payment_method,
                'status': payment.status,
                'invoice': {
                    'id': payment.invoice.id if hasattr(payment, 'invoice') else None,
                    'invoice_number': payment.invoice.invoice_number if hasattr(payment, 'invoice') else None,
                    'issued_date': payment.invoice.issued_date if hasattr(payment, 'invoice') else None,
                } if hasattr(payment, 'invoice') else None
            }
        except Payment.DoesNotExist:
            return None