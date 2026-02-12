from rest_framework import serializers
from .models import Review

class ReviewSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    hotel_name = serializers.CharField(source='hotel.name', read_only=True)
    is_owner = serializers.SerializerMethodField()
    can_edit = serializers.SerializerMethodField()
    
    class Meta:
        model = Review
        fields = [
            'id', 'user', 'username', 'hotel', 'hotel_name',
            'reservation', 'rating', 'comment',
            'created_at', 'updated_at', 'is_owner', 'can_edit'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']
    
    def get_is_owner(self, obj):
        request = self.context.get('request')
        if request and request.user:
            return obj.user == request.user
        return False
    
    def get_can_edit(self, obj):
        request = self.context.get('request')
        if request and request.user:
            return obj.user == request.user
        return False
    
    def validate(self, data):
        request = self.context.get('request')
        user = request.user
        hotel = data.get('hotel')
        
        # Vérifier que l'utilisateur n'a pas déjà un avis pour cet hôtel
        if not self.instance:  # Création seulement
            if Review.objects.filter(user=user, hotel=hotel).exists():
                raise serializers.ValidationError(
                    "Vous avez déjà laissé un avis pour cet hôtel."
                )
        
        return data