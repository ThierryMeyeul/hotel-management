from rest_framework import serializers

from .models import Reservation


class ReservationSerializer(serializers.ModelSerializer):
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
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']