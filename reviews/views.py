from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Avg, Count, Q
from .models import Review
from hotels.models import Hotel
from reservations.models import Reservation
from .serialiers import ReviewSerializer
from django.utils import timezone
from datetime import timedelta
from django.db.models.functions import TruncMonth, TruncWeek

class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Review.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'], url_path='my-reviews')
    def my_reviews(self, request):
        """Récupérer tous les avis de l'utilisateur connecté"""
        reviews = self.get_queryset()
        serializer = self.get_serializer(reviews, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='eligible-reservations')
    def eligible_reservations(self, request):
        """Récupérer les réservations terminées sans avis"""
        user = request.user
        
        # Réservations terminées
        completed_bookings = Reservation.objects.filter(
            user=user,
            status='COMPLETED'
        )
        
        # Exclure les hôtels déjà notés
        reviewed_hotels = Review.objects.filter(user=user).values_list('hotel_id', flat=True)
        
        eligible = completed_bookings.exclude(
            room__hotel_id__in=reviewed_hotels
        ).select_related('room__hotel')
        
        data = []
        for booking in eligible:
            data.append({
                'id': booking.id,
                'hotel_id': booking.room.hotel.id,
                'hotel_name': booking.room.hotel.name,
                'check_in': booking.check_in,
                'check_out': booking.check_out,
                'created_at': booking.created_at
            })
        
        return Response(data)
    
    @action(detail=False, methods=['get'], url_path='can-review/(?P<hotel_id>[^/.]+)')
    def can_review(self, request, hotel_id=None):
        """Vérifier si l'utilisateur peut laisser un avis pour un hôtel"""
        user = request.user
        
        try:
            hotel = Hotel.objects.get(id=hotel_id)
        except Hotel.DoesNotExist:
            return Response({'can_review': False, 'error': 'Hôtel non trouvé'})
        
        # Vérifier si l'utilisateur a déjà un avis
        existing_review = Review.objects.filter(user=user, hotel=hotel).first()
        
        if existing_review:
            serializer = self.get_serializer(existing_review)
            return Response({
                'can_review': True,
                'existing_review': serializer.data,
                'message': 'Vous avez déjà un avis pour cet hôtel. Vous pouvez le modifier.'
            })
        
        # Vérifier si l'utilisateur a une réservation terminée pour cet hôtel
        has_completed_booking = Reservation.objects.filter(
            user=user,
            room__hotel=hotel,
            status='COMPLETED'
        ).exists()
        
        if has_completed_booking:
            return Response({
                'can_review': True,
                'existing_review': None,
                'message': 'Vous pouvez laisser un avis pour cet hôtel.'
            })
        else:
            return Response({
                'can_review': False,
                'existing_review': None,
                'message': 'Vous devez avoir séjourné dans cet hôtel pour laisser un avis.'
            })
    
    @action(detail=False, methods=['get'], url_path='hotel/(?P<hotel_id>[^/.]+)')
    def hotel_reviews(self, request, hotel_id=None):
        """Récupérer tous les avis d'un hôtel"""
        reviews = Review.objects.filter(hotel_id=hotel_id).select_related('user')
        
        # Statistiques
        stats = reviews.aggregate(
            average_rating=Avg('rating'),
            total_reviews=Count('id')
        )
        
        # Distribution des notes
        distribution = {}
        for i in range(1, 6):
            distribution[i] = reviews.filter(rating=i).count()
        
        serializer = self.get_serializer(reviews, many=True)
        
        return Response({
            'reviews': serializer.data,
            'stats': {
                'average_rating': round(stats['average_rating'] or 0, 1),
                'total_reviews': stats['total_reviews'] or 0,
                'rating_distribution': distribution
            }
        })
        
class DirectorReviewViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet pour les directeurs - consultation des avis de leurs hôtels"""
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Récupérer uniquement les avis des hôtels gérés par le directeur"""
        user = self.request.user
        
        # Vérifier que l'utilisateur est bien un directeur ou admin
        if user.role not in ['DIRECTOR', 'ADMIN']:
            return Review.objects.none()
        
        # Récupérer les hôtels du directeur
        hotels = Hotel.objects.filter(manager=user)
        
        # Retourner les avis de ces hôtels
        return Review.objects.filter(hotel__in=hotels).select_related('user', 'hotel')
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Statistiques globales des avis pour le directeur"""
        queryset = self.get_queryset()
        
        # Statistiques générales
        total_reviews = queryset.count()
        average_rating = queryset.aggregate(avg=Avg('rating'))['avg'] or 0
        
        # Distribution des notes
        rating_distribution = {
            '1': queryset.filter(rating=1).count(),
            '2': queryset.filter(rating=2).count(),
            '3': queryset.filter(rating=3).count(),
            '4': queryset.filter(rating=4).count(),
            '5': queryset.filter(rating=5).count(),
        }
        
        # Répartition par hôtel
        reviews_by_hotel = queryset.values(
            'hotel__id', 
            'hotel__name'
        ).annotate(
            count=Count('id'),
            average=Avg('rating')
        ).order_by('-count')
        
        # Derniers avis
        latest_reviews = queryset.order_by('-created_at')[:5]
        latest_reviews_data = ReviewSerializer(latest_reviews, many=True, context={'request': request}).data
        
        return Response({
            'total_reviews': total_reviews,
            'average_rating': round(average_rating, 1),
            'rating_distribution': rating_distribution,
            'reviews_by_hotel': reviews_by_hotel,
            'latest_reviews': latest_reviews_data
        })
    
    @action(detail=False, methods=['get'], url_path='hotel/(?P<hotel_id>[^/.]+)')
    def hotel_reviews(self, request, hotel_id=None):
        """Récupérer tous les avis d'un hôtel spécifique"""
        try:
            hotel = Hotel.objects.get(id=hotel_id)
            
            # Vérifier que le directeur a accès à cet hôtel
            if request.user.role != 'ADMIN' and hotel.manager != request.user:
                return Response(
                    {'error': 'Vous n\'avez pas accès à cet hôtel'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            reviews = Review.objects.filter(hotel=hotel).select_related('user')
            
            # Filtres optionnels
            rating = request.query_params.get('rating')
            if rating and rating != 'all':
                reviews = reviews.filter(rating=int(rating))
            
            date_from = request.query_params.get('date_from')
            if date_from:
                reviews = reviews.filter(created_at__gte=date_from)
            
            date_to = request.query_params.get('date_to')
            if date_to:
                reviews = reviews.filter(created_at__lte=date_to)
            
            # Statistiques de l'hôtel
            stats = reviews.aggregate(
                average_rating=Avg('rating'),
                total_reviews=Count('id')
            )
            
            # Distribution des notes
            distribution = {}
            for i in range(1, 6):
                distribution[i] = reviews.filter(rating=i).count()
            
            # Pagination
            page = int(request.query_params.get('page', 1))
            page_size = int(request.query_params.get('page_size', 10))
            
            start = (page - 1) * page_size
            end = start + page_size
            
            paginated_reviews = reviews.order_by('-created_at')[start:end]
            
            serializer = ReviewSerializer(paginated_reviews, many=True, context={'request': request})
            
            return Response({
                'hotel_id': hotel.id,
                'hotel_name': hotel.name,
                'reviews': serializer.data,
                'stats': {
                    'average_rating': round(stats['average_rating'] or 0, 1),
                    'total_reviews': stats['total_reviews'] or 0,
                    'rating_distribution': distribution
                },
                'pagination': {
                    'page': page,
                    'page_size': page_size,
                    'total': reviews.count(),
                    'total_pages': (reviews.count() + page_size - 1) // page_size
                }
            })
            
        except Hotel.DoesNotExist:
            return Response(
                {'error': 'Hôtel non trouvé'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'], url_path='export/(?P<hotel_id>[^/.]+)')
    def export_reviews(self, request, hotel_id=None):
        """Exporter les avis d'un hôtel en CSV"""
        try:
            hotel = Hotel.objects.get(id=hotel_id)
            
            # Vérifier les permissions
            if request.user.role != 'ADMIN' and hotel.manager != request.user:
                return Response(
                    {'error': 'Vous n\'avez pas accès à cet hôtel'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            reviews = Review.objects.filter(hotel=hotel).select_related('user').order_by('-created_at')
            
            import csv
            from django.http import HttpResponse
            
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = f'attachment; filename="avis_{hotel.name}_{timezone.now().strftime("%Y%m%d")}.csv"'
            
            writer = csv.writer(response)
            writer.writerow(['Date', 'Client', 'Note', 'Commentaire'])
            
            for review in reviews:
                writer.writerow([
                    review.created_at.strftime('%d/%m/%Y %H:%M'),
                    review.user.username,
                    f"{review.rating}/5",
                    review.comment
                ])
            
            return response
            
        except Hotel.DoesNotExist:
            return Response(
                {'error': 'Hôtel non trouvé'},
                status=status.HTTP_404_NOT_FOUND
            )