from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone_number', 'is_blocked']
        extra_kwargs = {
            'password': {'write_only': True},
        }
    
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
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'password', 'role', 'phone_number']
        extra_kwargs = {
            'password': {'write_only': True},
        }
    
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user
    
    
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    token = serializers.CharField(read_only=True)
    role = serializers.CharField(read_only=True)
    
    def validate(self, data):
        if data['username'] and data['password']:
            if not User.objects.filter(username=data['username']).exists():
                raise serializers.ValidationError("User with this username does not exist.")
            
            user = authenticate(username=data['username'], password=data['password'])
            
            if not user:
                raise serializers.ValidationError("Unable to log in with provided credentials.")
            
            refresh = RefreshToken.for_user(user)
            
            data['data'] = {
                'username': user.username,
                'role': user.role,
                'token': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token)
                }
            }
            return data['data']
        else:
            raise serializers.ValidationError("Must include 'username' and 'password'.")