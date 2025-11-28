from django.shortcuts import render
from rest_framework import generics, viewsets
from rest_framework.response import Response

from users.models import User
from users.serializers import RegisterSerializer, LoginSerializer

class RegisterAPIView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    
    
class LoginAPIView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data['data'])