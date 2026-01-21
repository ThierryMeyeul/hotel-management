from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action

from .models import Reservation
from .serializers import ReservationSerializer
from .permissions import ReservationPermission


class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer
    permission_classes = [permissions.IsAuthenticated, ReservationPermission]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return Reservation.objects.all()
        elif user.role == 'DIRECTOR':
            return Reservation.objects.filter(room__hotel__manager=user)
        else:
            return Reservation.objects.filter(user=user)
        
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def my_reservations(self, request):
        """Retrieve reservations for the authenticated user."""
        user = request.user
        reservations = Reservation.objects.filter(user=user)
        page = self.paginate_queryset(reservations)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(reservations, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='by-hotel')
    def by_hotel(self, request):
        hotel_name = request.query_params.get('hotel_name')
        if not hotel_name:
            return Response({"error": "hotel_name parameter is required"}, status=400)
    
        reservations = Reservation.objects.filter(
            room__hotel__isnull=False,
            room__hotel__name__iexact=hotel_name
        )
    
        serializer = self.get_serializer(reservations, many=True)
        return Response(serializer.data)
