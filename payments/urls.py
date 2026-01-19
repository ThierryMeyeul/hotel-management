from rest_framework.routers import DefaultRouter
from .views import PaymentViewSet, InvoiceViewSet

router = DefaultRouter()
router.register(r'payments', PaymentViewSet, basename='payment')
router.register(r'invoices', InvoiceViewSet, basename='invoice')

urlpatterns = router.urls
