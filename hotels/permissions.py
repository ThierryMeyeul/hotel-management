from rest_framework import serializers, viewsets
from rest_framework.permissions import BasePermission, SAFE_METHODS

from .serializers import HotelSerializer, RoomSerializer, HotelImageSerializer
from .models import Hotel, Room, HotelImage


class HotelPermission(BasePermission):
    def has_permission(self, request, view):
        action = getattr(view, 'action', None)

        # Special rules for room-related endpoints
        if action in ('rooms', 'room_detail', 'images', 'image_detail'):
            # Viewing rooms/images: only authenticated users with role ADMIN, CLIENT or DIRECTOR
            if request.method in SAFE_METHODS:
                return request.user.is_authenticated and getattr(request.user, 'role', None) in ('ADMIN', 'CLIENT', 'DIRECTOR')
            # Creating/updating/deleting rooms/images: only DIRECTORs
            return request.user.is_authenticated and getattr(request.user, 'role', None) == 'DIRECTOR'

        # assign_manager action: only ADMIN can call POST
        if action == 'assign_manager' and request.method == 'POST':
            return request.user.is_authenticated and getattr(request.user, 'role', None) == 'ADMIN'

        # Default behavior for other endpoints
        if request.method in SAFE_METHODS:
            return True
        # Only admins can create hotels
        if request.method == 'POST':
            return request.user.is_authenticated and getattr(request.user, 'role', None) == 'ADMIN'
        # For other unsafe methods, require authentication and defer to object permissions
        return request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Safe methods are allowed (object-level checks not necessary for reads)
        if request.method in SAFE_METHODS:
            return True

        action = getattr(view, 'action', None)

        # For room-related unsafe methods, only the DIRECTOR who manages the hotel can modify
        if action in ('rooms', 'room_detail', 'images', 'image_detail'):
            return request.user.is_authenticated and getattr(request.user, 'role', None) == 'DIRECTOR' and obj.manager == request.user

        # Default: admins can do anything, directors only if they manage the hotel
        if getattr(request.user, 'role', None) == 'ADMIN':
            return True
        if getattr(request.user, 'role', None) == 'DIRECTOR':
            return obj.manager == request.user
        return False