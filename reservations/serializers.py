from rest_framework import serializers
from payments.serializers import PaymentSerializer

from .models import Reservation


class ReservationSerializer(serializers.ModelSerializer):
    hotel_name = serializers.CharField(source='room.hotel.name', read_only=True)
    payment = serializers.SerializerMethodField()
    class Meta:
        model = Reservation
        fields = [
            'id',
            'user',
            'room',
            'check_in',
            'check_out',
            'status',
            'total_price',
            'created_at',
            'updated_at',
            'hotel_name',
            'payment',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
        
    def get_payment(self, obj):
        try:
            payment = obj.payment
            return {
                'id': payment.id,
                'amount': str(payment.amount),
                'payment_date': payment.payment_date,
                'payment_method': payment.payment_method,
                'status': payment.status,
                'invoice': {
                    'id': payment.invoice.id,
                    'invoice_number': payment.invoice.invoice_number,
                    'issued_date': payment.invoice.issued_date,
                    'total_amount': str(payment.invoice.total_amount),
                } if hasattr(payment, 'invoice') else None
            }
        except:
            return None