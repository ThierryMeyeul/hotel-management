from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail
from django.conf import settings

from .models import User
from .tokens import account_activation_token


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone_number', 'is_blocked', 'date_joined']
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
        user.is_active = False  # Deactivate account until it is confirmed
        user.save()
        
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = account_activation_token.make_token(user)
        activation_link = f"http://127.0.0.1:5173/activate/{uid}/{token}/"
        
        subject = "Activez votre compte sur Hotel Management"
        message = f"""
            Bonjour {user.username},

            Merci de vous être inscrit sur notre application Hotel Management !

            Pour activer votre compte et commencer à profiter de toutes nos fonctionnalités, veuillez cliquer sur le lien ci-dessous :

            🔗 {activation_link}
            ⚠️ Ce lien est valable pour une durée limitée et est destiné uniquement à votre adresse e-mail.

            Si vous n'avez pas créé de compte sur Hotel Management, vous pouvez ignorer ce message.

            Nous sommes ravis de vous accueillir parmi nous et espérons que vous apprécierez votre expérience !

            Cordialement,
            L'équipe Hotel Management
        """
        
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[user.email],
            fail_silently=False,
        )
        
        return user
    
    
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    token = serializers.CharField(read_only=True)
    role = serializers.CharField(read_only=True)
    
    def validate(self, data):
        if data['username'] and data['password']:           
            try:
                user = User.objects.get(username=data['username'])
            except User.DoesNotExist:
                raise serializers.ValidationError("User with this username does not exist.")
            
            if not user.is_active:
                raise serializers.ValidationError("Account is not activated. Please check your email for the activation link.")
            
            user = authenticate(username=data['username'], password=data['password'])
            
            if not user:
                raise serializers.ValidationError("Unable to log in with provided credentials.")
            
            if user.is_blocked:
                raise serializers.ValidationError("Your account is blocked. Please speak with an administrator to learn more.")
            
            refresh = RefreshToken.for_user(user)
            
            data['data'] = {
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'role': user.role,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name
                },
                'token': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token)
                }
            }
            return data
        else:
            raise serializers.ValidationError("Must include 'username' and 'password'.")