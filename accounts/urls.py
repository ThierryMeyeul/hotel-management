from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import RegisterView, LoginView, UserViewSet, ActivateAccountView, LogoutView, AdminDashboardViewSet


router = DefaultRouter()
router.register(r'users', UserViewSet)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('activate/<uidb64>/<token>/', ActivateAccountView.as_view(), name='activate'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('admin/dashboard/stats/', AdminDashboardViewSet.as_view({'get': 'get_dashboard_stats'}), name='admin-dashboard-stats'),
    path('admin/roles/distribution/', AdminDashboardViewSet.as_view({'get': 'get_role_distribution'}), name='role-distribution'),
    path('admin/activity/', AdminDashboardViewSet.as_view({'get': 'get_recent_activity'}), name='recent-activity'),
    path('admin/recent-hotels/', AdminDashboardViewSet.as_view({'get': 'get_recent_hotels'}), name='recent-hotels'),
    path('admin/recent-reservations/', AdminDashboardViewSet.as_view({'get': 'get_recent_reservations'}), name='recent-reservations'),
]

urlpatterns += router.urls