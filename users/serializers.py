from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

from users.models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'hotel', 'first_name', 'last_name', 'password']
        read_only_fields = ['hotel', 'role'] # On évite que le client change son rôle
        extra_kwargs = {'password': {'write_only': True}}
        
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        user = super().update(instance, validated_data)
        if password: 
            user.set_password(password)
            user.save()
            
        return user
        
        
class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'hotel', 'first_name', 'last_name', 'password', 'phone_number']
        extra_kwargs = {'password': {'write_only': True}}
        
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password :
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save()
        return user
    
    
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    token = serializers.CharField(read_only=True)
    
    def validate(self, data):
        if data['username'] and data['password']:
            if not User.objects.filter(username=data['username']):
                raise serializers.ValidationError('Invalid username.')
            
            user = authenticate(
                username=data['username'],
                password=data['password']
            )
            
            if not user:
                raise serializers.ValidationError('Invalid password.')
            
            refresh = RefreshToken.for_user(user)
            
            data['data'] = {
                'username': user.username,
                'role': user.role,
                'token': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token)
                }
            }
        
        else:
            raise serializers.ValidationError('The username and password are required')
        
        return data