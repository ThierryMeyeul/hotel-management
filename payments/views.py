from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Payment, Invoice
from .serializers import PaymentSerializer, InvoiceSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from datetime import datetime

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]  # tu peux adapter selon tes besoins

class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'])
    def generate(self, request):
        payment_id = request.data.get('payment_id')
        try:
            payment = Payment.objects.get(id=payment_id)
            # Générer un numéro de facture unique
            invoice_number = f"INV-{payment_id}-{datetime.now().strftime('%Y%m%d')}"
            
            invoice = Invoice.objects.create(
                payment=payment,
                invoice_number=invoice_number,
                total_amount=payment.amount
            )
            serializer = self.get_serializer(invoice)
            return Response(serializer.data)
        except Payment.DoesNotExist:
            return Response({'error': 'Payment not found'}, status=status.HTTP_404_NOT_FOUND)