from django.shortcuts import render
from rest_framework import generics, viewsets
from rest_framework.response import Response
from rest_framework import status

from users.models import User, RoleEnum
from users.serializers import RegisterSerializer, LoginSerializer, UserSerializer

class RegisterAPIView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    
    
class LoginAPIView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data['data'])
    

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return RegisterSerializer
        return UserSerializer
    
    def update(self, request, *args, **kwargs):
        user = self.get_object()
        
        if request.user.role != RoleEnum.SUPER_ADMIN and request.user != user:
            return Response(
                {'detail': 'You can only modify your own account.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().update(request, *args, **kwargs)