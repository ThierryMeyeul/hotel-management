from rest_framework import serializers

from .models import Hotel, HotelImage, Room, Favorite


class HotelImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = HotelImage
        fields = ['id', 'image', 'caption', 'is_cover']
        
        
class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ['id', 'room_number', 'room_type', 'price_per_night', 'is_available', 'description', 'amenities', 'size', 'capacity'] 
        
        
class HotelSerializer(serializers.ModelSerializer): 
    distance = serializers.SerializerMethodField()
    images = HotelImageSerializer(many=True, read_only=True)
    rooms = RoomSerializer(many=True, read_only=True)
    is_favorite = serializers.SerializerMethodField()
    total_favorites = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Hotel
        fields = [
            'id', 'name', 'address', 'description', 'city', 'country', 'email',
            'latitude', 'longitude', 'location', 'manager', 'created_at', 'updated_at',
            'images', 'rooms', 'is_active', 'distance', 'website', 'phone', 'is_favorite',
            'total_favorites',
        ]
        read_only_fields = ['created_at', 'updated_at', 'location', 'distance', 'is_favorite', 'total_favorites']
        
    def get_distance(self, obj):
        if hasattr(obj, 'distance_km'):
            return round(obj.distance_km, 2)
        return None

    def get_total_favorites(self, obj):
        return obj.favorited_by.count()

    def get_is_favorite(self, obj):
        request = self.context.get("request")

        if request and request.user.is_authenticated:
            return obj.favorited_by.filter(user=request.user).exists()

        return False

class NearbyHotelsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hotel
        fields = ["latitude", "longitude", "radius", "max_results"]
    latitude = serializers.FloatField(required=True, min_value=-90.0, max_value=90.0)
    longitude = serializers.FloatField(required=True, min_value=-180.0, max_value=180.0)
    radius = serializers.FloatField(required=False, default=50, min_value=1.0, max_value=1000.0)
    max_results = serializers.IntegerField(required=False, default=20, min_value=1, max_value=100)
    
    def validate(self, attrs):
        return attrs
    
    
class FavoriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Favorite
        fields = ['id', 'user', 'hotel', 'created_at']
        read_only_fields = ['created_at']