from rest_framework.permissions import BasePermission, SAFE_METHODS


class ReservationPermission(BasePermission):
    def has_permission(self, request, view):
        # Allow read-only access for any request
        if request.method in SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to authenticated users
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Allow read-only methods
        if request.method in SAFE_METHODS:
            return True

        # Only the reservation owner (client) or the hotel's manager (director)
        # can modify or delete this reservation.
        if request.user == obj.user:
            return True

        if request.user.role == 'DIRECTOR' and obj.room.hotel.manager == request.user:
            return True
        
        return False