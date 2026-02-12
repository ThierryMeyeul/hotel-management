from django.shortcuts import render
from rest_framework import generics, status, viewsets
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.exceptions import PermissionDenied
from rest_framework.decorators import action
from django.db.models import Count, Q, Sum
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework.decorators import api_view, permission_classes

from .models import User, RoleEnum
from .serializers import UserSerializer, RegisterSerializer, LoginSerializer
from .tokens import account_activation_token
from .permissions import IsAdmin
from hotels.models import Hotel
from reservations.models import Reservation


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    
    
class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data['data'], status=status.HTTP_200_OK)
    
    
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return RegisterSerializer
        return UserSerializer
    
    def update(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)
        
        user = self.get_object()

        if request.user.role != RoleEnum.ADMIN and request.user != user:
            return Response({"detail": "You do not have permission to perform this action."}, status=status.HTTP_403_FORBIDDEN)
        
        return super().update(request, *args, **kwargs)

    @action(detail=False, methods=['get'], url_path='directors')
    def directors(self, request):
        # Sécurité : ADMIN seulement
        if request.user.role != 'ADMIN':
            raise PermissionDenied("Accès réservé à l'administrateur.")

        directors = User.objects.filter(
            role='DIRECTOR'
        )

        serializer = self.get_serializer(directors, many=True)
        return Response(serializer.data)

    
    
class ActivateAccountView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None
        
        if user is not None and account_activation_token.check_token(user, token):
            user.is_active = True
            user.save()
            return Response({"detail": "Account activated successfully."}, status=status.HTTP_200_OK)
        else:
            return Response({"detail": "Activation link is invalid!"}, status=status.HTTP_400_BAD_REQUEST)
        

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"detail": "Logout successful."}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({"detail": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)
        
        
class AdminDashboardViewSet(viewsets.ViewSet):
    permission_classes = [IsAdmin]
    
    def get_dashboard_stats(self, request):
        total_users = User.objects.count()
        active_hotels = Hotel.objects.filter(is_active=True).count()
        total_reservations = Reservation.objects.count()
        
        thirty_days_ago = timezone.now() - timedelta(days=30)
        revenue_last_30_days = Reservation.objects.filter(
            created_at__gte=thirty_days_ago,
            status='CONFIRMED'
        ).aggregate(total=Sum('total_price'))['total'] or 0
        
        stats = {
            'total_users': total_users,
            'active_hotels': active_hotels,
            'revenue_last_30_days': float(revenue_last_30_days),
            'total_reservations': total_reservations,
            'user_change_percentage': 12.5,
            'hotel_change_percentage': 2.5,
            'booking_change_percentage': 18.2,
            'revenue_change_percentage': -3.2,
        }
        
        return Response(stats)
    
    def get_role_distribution(self, request):
        distribution = User.objects.values('role').annotate(count=Count('role'))
        result = {
            'admin': 0,
            'director': 0, 
            'client': 0,
        }
        
        for item in distribution:
            role_lower = item['role'].lower()
            if role_lower in result:
                result[role_lower] = item['count']
        
        return Response(result)
    
    def get_recent_activity(self, request):
        # Données d'activité des 7 derniers jours
        seven_days_ago = timezone.now() - timedelta(days=7)
        
        activity_data = []
        for i in range(7):
            date = timezone.now() - timedelta(days=i)
            start_of_day = date.replace(hour=0, minute=0, second=0, microsecond=0)
            end_of_day = date.replace(hour=23, minute=59, second=59, microsecond=999999)
            
            bookings_count = Reservation.objects.filter(
                created_at__range=[start_of_day, end_of_day]
            ).count()
            
            revenue = Reservation.objects.filter(
                created_at__range=[start_of_day, end_of_day],
                status='confirmed'
            ).aggregate(total=Sum('total_price'))['total'] or 0
            
            new_users = User.objects.filter(
                date_joined__range=[start_of_day, end_of_day]
            ).count()
            
            activity_data.append({
                'date': start_of_day.date().isoformat(),
                'bookings': bookings_count,
                'revenue': float(revenue),
                'new_users': new_users
            })
        
        return Response(activity_data)
    
    @action(detail=False, methods=['get'], url_path='recent-hotels')
    def get_recent_hotels(self, request):
        """Récupère les 5 derniers hôtels ajoutés"""
        from hotels.models import Hotel
        
        recent_hotels = Hotel.objects.all().order_by('-created_at')[:5]
        
        data = []
        for hotel in recent_hotels:
            # Gestion du nom du manager
            manager_name = ""
            if hotel.manager:
                if hotel.manager.first_name and hotel.manager.last_name:
                    manager_name = f"{hotel.manager.first_name} {hotel.manager.last_name}".strip()
                elif hotel.manager.username:
                    manager_name = hotel.manager.username
                else:
                    manager_name = hotel.manager.email
            else:
                manager_name = "Non assigné"
            
            # Compter les réservations
            bookings_count = Reservation.objects.filter(room__hotel=hotel).count()
            
            # Déterminer le statut
            status = "Actif" if hotel.is_active else "Inactif"
            
            data.append({
                'id': hotel.id,
                'name': hotel.name,
                'city': hotel.city,
                'status': status,
                'bookings_count': bookings_count,
                'manager_name': manager_name,
                'created_at': hotel.created_at,
                'is_active': hotel.is_active,
                'email': hotel.email or "Non renseigné",
                'phone': hotel.phone or "Non renseigné"
            })
        
        return Response(data)
    
    @action(detail=False, methods=['get'], url_path='recent-reservations')
    def get_recent_reservations(self, request):
        """Récupère les 5 dernières réservations"""
        from reservations.models import Reservation
        
        recent_reservations = Reservation.objects.all().order_by('-created_at')[:5]
        
        data = []
        for reservation in recent_reservations:
            # Formater l'ID de réservation
            reservation_id = f"RES-{reservation.id:06d}"
            
            # Informations de l'utilisateur
            user_name = ""
            if reservation.user:
                if reservation.user.first_name and reservation.user.last_name:
                    user_name = f"{reservation.user.first_name} {reservation.user.last_name}".strip()
                elif reservation.user.username:
                    user_name = reservation.user.username
                else:
                    user_name = reservation.user.email
            
            # Informations de l'hôtel
            hotel_name = (
                reservation.room.hotel.name
                if reservation.room and reservation.room.hotel
                else "Hôtel inconnu"
            )
            
            # Formater le statut
            status_map = {
                'PENDING': 'En attente',
                'CONFIRMED': 'Confirmée',
                'CANCELLED': 'Annulée',
                'COMPLETED': 'Terminée'
            }
            status = status_map.get(reservation.status, reservation.status)
            
            data.append({
                'id': reservation_id,
                'hotel_name': hotel_name,
                'user_name': user_name,
                'amount': float(reservation.total_price),
                'status': status,
                'created_at': reservation.created_at.date().isoformat(),
                'check_in': reservation.check_in.isoformat() if reservation.check_in else None,
                'check_out': reservation.check_out.isoformat() if reservation.check_out else None
            })
        
        return Response(data)
    
    
class AdminUserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filtrage par rôle
        role = self.request.query_params.get('role')
        if role:
            queryset = queryset.filter(role=role)
        
        # Filtrage par statut
        status_filter = self.request.query_params.get('status')
        if status_filter == 'active':
            queryset = queryset.filter(is_blocked=False)
        elif status_filter == 'blocked':
            queryset = queryset.filter(is_blocked=True)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def toggle_block(self, request, pk=None):
        user = self.get_object()
        user.is_blocked = not user.is_blocked
        user.save()
        
        status_text = "blocked" if user.is_blocked else "unblocked"
        return Response({
            'message': f'Utilisateur {status_text} avec succès',
            'is_blocked': user.is_blocked
        })
        
class UserProfileView(generics.RetrieveUpdateAPIView):
    """Récupérer et mettre à jour le profil de l'utilisateur connecté"""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    

class UserDetailView(generics.RetrieveAPIView):
    """Récupérer un utilisateur par son ID (pour admin)"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        # Seul l'admin peut voir les autres profils
        if request.user.role == 'CLIENT' and request.user.id != kwargs.get('pk'):
            return Response(
                {'error': 'Vous n\'avez pas la permission de voir ce profil'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().get(request, *args, **kwargs)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """Changer le mot de passe de l'utilisateur connecté"""
    user = request.user
    data = request.data
    
    # Vérifier l'ancien mot de passe
    if not user.check_password(data.get('current_password')):
        return Response(
            {'message': 'Mot de passe actuel incorrect'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Vérifier que le nouveau mot de passe correspond à la confirmation
    if data.get('new_password') != data.get('confirm_password'):
        return Response(
            {'message': 'Les mots de passe ne correspondent pas'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Valider le nouveau mot de passe
    try:
        validate_password(data.get('new_password'), user)
    except ValidationError as e:
        return Response(
            {'message': e.messages},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Changer le mot de passe
    user.set_password(data.get('new_password'))
    user.save()
    
    return Response(
        {'message': 'Mot de passe modifié avec succès'},
        status=status.HTTP_200_OK
    )