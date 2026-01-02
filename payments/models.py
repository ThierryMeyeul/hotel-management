from django.db import models
from reservations.models import Reservation


class Payment(models.Model):
    
    class PayemntStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        COMPLETED = 'COMPLETED', 'Completed'
        FAILED = 'FAILED', 'Failed'
        
    class PaymentMethod(models.TextChoices):
        CREDIT_CARD = 'CREDIT_CARD', 'Credit Card'
        PAYPAL = 'PAYPAL', 'PayPal'
        BANK_TRANSFER = 'BANK_TRANSFER', 'Bank Transfer'
        MOBLILE_MONEY = 'MOBILE_MONEY', 'Mobile Money'
    
    reservation = models.OneToOneField(Reservation, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateTimeField(auto_now_add=True)
    payment_method = models.CharField(max_length=20, choices=PaymentMethod.choices)
    status = models.CharField(max_length=20, choices=PayemntStatus.choices, default=PayemntStatus.PENDING)

    def __str__(self):
        return f"Payment of {self.amount} for Reservation {self.reservation.id}"
    
    
class Invoice(models.Model):
    payment = models.OneToOneField(Payment, on_delete=models.CASCADE)
    issued_date = models.DateTimeField(auto_now_add=True)
    Invoice_number = models.CharField(max_length=50, unique=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"Invoice for Payment {self.payment.id}"