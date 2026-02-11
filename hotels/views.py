from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django.contrib.auth import get_user_model
from rest_framework.permissions import IsAuthenticated
from django.views.decorators.csrf import csrf_exempt
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.decorators import action, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated

from .models import Hotel, Room, HotelImage, Favorite
from .serializers import HotelSerializer, RoomSerializer, HotelImageSerializer, NearbyHotelsSerializer, FavoriteSerializer
from .permissions import HotelPermission
from .utils.geolocation import get_nearby_hotels



user = get_user_model()

class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return 

class HotelViewSet(viewsets.ModelViewSet): 
    queryset = Hotel.objects.filter()
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
        
    @action(detail=False, methods=['get'], url_path='no-manager')
    def hotels_without_manager(self, request):
        hotels = Hotel.objects.filter(manager__isnull=True, is_active=True)
        serializer = self.get_serializer(hotels, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

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
    
    
    @action(detail=False, methods=['get'], url_path='my-hotels')
    def my_hotels(self, request):
        """
        Retourne la liste des hôtels gérés par le directeur connecté.
        """
        user = request.user

        # Vérifie si l'utilisateur est bien un directeur
        if getattr(user, 'role', None) != 'DIRECTOR':
            return Response({"detail": "Vous n'êtes pas autorisé à voir cette liste."},
                            status=status.HTTP_403_FORBIDDEN)

        hotels = Hotel.objects.filter(manager=user)
        serializer = self.get_serializer(hotels, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='nearby')
    def nearby_hotels(self, request):
        serializer = NearbyHotelsSerializer(data=request.query_params)
        if not serializer.is_valid():
            return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        latitude = data['latitude']
        longitude = data['longitude']
        radius = data.get('radius', 50)
        max_results = data.get('max_results', 20)
        
        try:
            nearby_hotels = get_nearby_hotels(latitude, longitude, radius_km=radius, max_results=max_results)
            serializer = self.get_serializer(nearby_hotels, many=True)
            return Response({
                "count": len(nearby_hotels),
                "user_location": {
                    "latitude": latitude,
                    "longitude": longitude
                },
                "search_radius_km": radius,
                "results": serializer.data
            })
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
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
    
    @action(detail=False, methods=['get'], url_path='by-country')
    def hotels_by_country(self, request):
        country = request.query_params.get('country')
        
        queryset = self.get_queryset()
        
        if country:
            queryset = queryset.filter(country__iexact=country)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='by-name')
    def by_name(self, request):
        """
        Récupère tous les hôtels dont le nom correspond au paramètre 'name'.
        """
        name = request.query_params.get('name')
        if not name:
            return Response({"error": "Le paramètre 'name' est requis"}, status=status.HTTP_400_BAD_REQUEST)

        hotels = Hotel.objects.filter(name__icontains=name)  # recherche insensible à la casse
        serializer = self.get_serializer(hotels, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='by-manager/(?P<manager_id>[^/.]+)')
    def by_manager(self, request, manager_id=None):
        """
        Récupère tous les hôtels gérés par un manager spécifique
        """
        hotels = self.queryset.filter(manager_id=manager_id, is_active=True)
        serializer = self.get_serializer(hotels, many=True)
        return Response(serializer.data)
    
    
class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.filter()
    serializer_class = RoomSerializer
    permission_classes = [HotelPermission]
    
    # def get_queryset(self):
    #     queryset = super().get_queryset()
        
    #     hotel_id = self.kwargs.get('hotel_pk')
    #     if hotel_id:
    #         queryset = queryset.filter(hotel_id=hotel_id)
    #     return queryset

class FavoriteViewSet(viewsets.ViewSet):
    """
    ViewSet pour gérer les favoris d'un utilisateur.
    """
    permission_classes = [IsAuthenticated]

    def list(self, request):
        """Liste tous les favoris de l'utilisateur connecté"""
        favorites = Favorite.objects.filter(user=request.user)
        serializer = FavoriteSerializer(favorites, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='my-hotels')
    def my_hotels(self, request):
        """Retourne les hôtels favoris de l'utilisateur connecté"""
        favorites = Favorite.objects.filter(user=request.user).select_related('hotel')
        hotels = [fav.hotel for fav in favorites]
        serializer = HotelSerializer(hotels, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='add')
    def add(self, request, pk=None):
        """Ajouter un hôtel aux favoris"""
        user = request.user
        try:
            hotel = Hotel.objects.get(id=pk, is_active=True)
        except Hotel.DoesNotExist:
            return Response({'detail': 'Hotel not found.'}, status=404)

        favorite, created = Favorite.objects.get_or_create(user=user, hotel=hotel)
        if not created:
            return Response({'detail': 'Hotel is already in favorites.'}, status=400)

        serializer = FavoriteSerializer(favorite)
        return Response(serializer.data, status=201)

    @action(detail=True, methods=['delete'], url_path='remove')
    def remove(self, request, pk=None):
        """Supprimer un hôtel des favoris"""
        user = request.user
        try:
            favorite = Favorite.objects.get(user=user, hotel_id=pk)
            favorite.delete()
            return Response(status=204)
        except Favorite.DoesNotExist:
            return Response({'detail': 'Favorite not found.'}, status=404)

    @action(detail=True, methods=['post'], url_path='toggle')
    def toggle(self, request, pk=None):
        # authentication_classes = [SessionAuthentication, BasicAuthentication]
        # permission_classes = [IsAuthenticated]
        """Ajouter ou retirer un hôtel des favoris"""
        user = request.user
        try:
            hotel = Hotel.objects.get(id=pk, is_active=True)
        except Hotel.DoesNotExist:
            return Response({'detail': 'Hotel not found.'}, status=404)

        favorite, created = Favorite.objects.get_or_create(user=user, hotel=hotel)
        if not created:
            favorite.delete()
            return Response({'detail': 'Hotel removed from favorites.'}, status=200)

        serializer = FavoriteSerializer(favorite)
        return Response(serializer.data, status=201)

    @action(detail=True, methods=['get'], url_path='check')
    def check(self, request, pk=None):
        """Vérifie si un hôtel est dans les favoris"""
        is_fav = Favorite.objects.filter(user=request.user, hotel_id=pk).exists()
        return Response({'is_favorite': is_fav})