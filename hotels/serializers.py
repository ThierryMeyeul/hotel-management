from rest_framework import serializers

from .models import Hotel, HotelImage, Room


class HotelImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = HotelImage
        fields = ['id', 'image', 'caption', 'is_cover']
        
        
class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ['id', 'room_number', 'room_type', 'price_per_night', 'is_available'] 
        
        
class HotelSerializer(serializers.ModelSerializer): 
    images = HotelImageSerializer(many=True, read_only=True)
    rooms = RoomSerializer(many=True, read_only=True)
    
    class Meta:
        model = Hotel
        fields = [
            'id', 'name', 'address', 'description', 'city', 'country',
            'latitude', 'longitude', 'manager', 'created_at', 'updated_at',
            'images', 'rooms'
        ]