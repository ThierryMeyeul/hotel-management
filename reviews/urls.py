from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReviewViewSet, DirectorReviewViewSet

router = DefaultRouter()
router.register(r'', ReviewViewSet, basename='review')
router.register(r'director', DirectorReviewViewSet, basename='director-reviews')


urlpatterns = [
    path('', include(router.urls)),
]