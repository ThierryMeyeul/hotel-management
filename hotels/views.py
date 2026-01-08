from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django.contrib.auth import get_user_model

from .models import Hotel, Room, HotelImage
from .serializers import HotelSerializer, RoomSerializer, HotelImageSerializer
from .permissions import HotelPermission


user = get_user_model()

class HotelViewSet(viewsets.ModelViewSet): 
    queryset = Hotel.objects.all()
    serializer_class = HotelSerializer
    permission_classes = [HotelPermission]
    
    def perform_create(self, serializer):
        manager = serializer.validated_data.get('manager')
        if manager and getattr(manager, 'role', None) != 'DIRECTOR':
            raise ValidationError({'manager': 'Only a DIRECTOR can be assigned as manager.'})
        serializer.save()

    def perform_update(self, serializer):
        manager = serializer.validated_data.get('manager')
        if manager and getattr(manager, 'role', None) != 'DIRECTOR':
            raise ValidationError({'manager': 'Only a DIRECTOR can be assigned as manager.'})
        serializer.save()

    @action(detail=True, methods=['post'], permission_classes=[HotelPermission])
    def assign_manager(self, request, pk=None):
        if not request.user.role == 'ADMIN':
           return Response({'detail': 'You do not have permission to perform this action.'}, status=403)
       
        hotel = self.get_object()
        user_id = request.data.get('user_id')
        
        try:
            manager = user.objects.get(id=user_id, role='DIRECTOR')
        except user.DoesNotExist:
            return Response({'detail': 'User not found or is not a DIRECTOR.'}, status=400)
        
        hotel.manager = manager
        hotel.save()
        
        return Response({'detail': f'Manager {manager.username} assigned to hotel {hotel.name}.'})
    
    @action(detail=True, methods=['get', 'post'], url_path='rooms')
    def rooms(self, request, pk=None):
        """List rooms for the selected hotel or create a room for it."""
        hotel = self.get_object()

        if request.method == 'GET':
            qs = hotel.rooms.all()
            page = self.paginate_queryset(qs)
            if page is not None:
                serializer = RoomSerializer(page, many=True, context={'request': request})
                return self.get_paginated_response(serializer.data)
            serializer = RoomSerializer(qs, many=True, context={'request': request})
            return Response(serializer.data)

        # POST -> create a room for this hotel
        serializer = RoomSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save(hotel=hotel)
        return Response(serializer.data, status=201)

    @action(detail=True, methods=['get', 'put', 'patch', 'delete'], url_path=r'rooms/(?P<room_pk>[^/.]+)')
    def room_detail(self, request, pk=None, room_pk=None):
        """Retrieve, update or delete a room for the selected hotel."""
        hotel = self.get_object()
        try:
            room = hotel.rooms.get(pk=room_pk)
        except Room.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=404)

        if request.method == 'GET':
            serializer = RoomSerializer(room, context={'request': request})
            return Response(serializer.data)

        if request.method in ('PUT', 'PATCH'):
            partial = request.method == 'PATCH'
            serializer = RoomSerializer(room, data=request.data, partial=partial, context={'request': request})
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)

        # DELETE
        room.delete()
        return Response(status=204)

    @action(detail=True, methods=['get', 'post'], url_path='images')
    def images(self, request, pk=None):
        """List images for the selected hotel or create an image for it."""
        hotel = self.get_object()

        if request.method == 'GET':
            qs = hotel.images.all()
            page = self.paginate_queryset(qs)
            if page is not None:
                serializer = HotelImageSerializer(page, many=True, context={'request': request})
                return self.get_paginated_response(serializer.data)
            serializer = HotelImageSerializer(qs, many=True, context={'request': request})
            return Response(serializer.data)

        # POST -> create an image for this hotel
        serializer = HotelImageSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save(hotel=hotel)
        return Response(serializer.data, status=201)

    @action(detail=True, methods=['get', 'put', 'patch', 'delete'], url_path=r'images/(?P<image_pk>[^/.]+)')
    def image_detail(self, request, pk=None, image_pk=None):
        """Retrieve, update or delete an image for the selected hotel."""
        hotel = self.get_object()
        try:
            image = hotel.images.get(pk=image_pk)
        except HotelImage.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=404)

        if request.method == 'GET':
            serializer = HotelImageSerializer(image, context={'request': request})
            return Response(serializer.data)

        if request.method in ('PUT', 'PATCH'):
            partial = request.method == 'PATCH'
            serializer = HotelImageSerializer(image, data=request.data, partial=partial, context={'request': request})
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)

        # DELETE
        image.delete()
        return Response(status=204)