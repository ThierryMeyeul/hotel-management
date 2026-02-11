from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import HotelViewSet, RoomViewSet, FavoriteViewSet


router = DefaultRouter()
router.register(r'', HotelViewSet, basename='hotel')
router.register(r'rooms', RoomViewSet, basename='room')
router.register(r'favorites', FavoriteViewSet, basename='favorite')

urlpatterns = [
    # path('favorites/', views.my_favorites, name='favorite-list-create'),
    # path('favorites/add/<int:hotel_id>/', views.add_favorite, name='favorite-add'),
    # path('favorites/remove/<int:hotel_id>/', views.remove_favorite, name='favorite-remove'),
    # path('favorites/check/<int:hotel_id>/', views.is_favorite, name='favorite-check'),
    # path('favorites/toogle/<int:hotel_id>/', views.toogle_favorite, name='favorite-toggle'),
    # path('favorites/my-hotels/', views.my_favorites_hotels, name='my-favorite-hotels'),
    
    path('', include(router.urls)),
]