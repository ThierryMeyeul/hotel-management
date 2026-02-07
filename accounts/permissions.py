from rest_framework.permissions import BasePermission


class IsAuthenticatedAndNotBlocked(BasePermission):
    """
    Autorise uniquement les utilisateurs connectés et non bloqués
    """

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and not request.user.is_blocked
        )


class IsAdmin(BasePermission):
    """
    Autorise uniquement les ADMIN
    """

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'ADMIN'
            and not request.user.is_blocked
        )


class IsDirector(BasePermission):
    """
    Autorise uniquement les DIRECTOR
    """

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'DIRECTOR'
            and not request.user.is_blocked
        )


class IsClient(BasePermission):
    """
    Autorise uniquement les CLIENT
    """

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'CLIENT'
            and not request.user.is_blocked
        )


class IsAdminOrDirector(BasePermission):
    """
    Autorise ADMIN ou DIRECTOR
    """

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in ['ADMIN', 'DIRECTOR']
            and not request.user.is_blocked
        )


class IsOwnerOrAdmin(BasePermission):
    """
    Autorise le propriétaire de l'objet ou un ADMIN
    À utiliser pour les détails / modifications
    """

    def has_object_permission(self, request, view, obj):
        return (
            request.user.is_authenticated
            and not request.user.is_blocked
            and (
                obj == request.user
                or request.user.role == 'ADMIN'
            )
        )