import api from '../api/axios';
import type { BookingData, PaymentData, Reservation } from '../types/booking';

export const bookingService = {
  // Créer une réservation
  async createReservation(bookingData: BookingData): Promise<Reservation> {
    const response = await api.post('/reservations/', bookingData);
    return response.data;
  },

  // Créer un paiement
  async createPayment(paymentData: PaymentData) {
    const response = await api.post('/payments/', paymentData);
    return response.data;
  },

  // Obtenir une réservation par ID
  async getReservation(id: number) {
    const response = await api.get(`/reservations/${id}/`);
    return response.data;
  },

  async getMyReservations() {
    const response = await api.get('/reservations/my_reservations/')
    return response.data
  },

  async updateReservationStatus(id: number, status: string) {
    const response = await api.patch(
      `/reservations/${id}/status/`,
      { status }
    )
    return response.data
  },

  // Obtenir les réservations de l'utilisateur
  async getUserReservations(userId: number) {
    const response = await api.get(`/reservations/user/${userId}/`);
    return response.data;
  },

  // Annuler une réservation
  async cancelReservation(id: number) {
    const response = await api.patch(`/reservations/${id}/cancel/`);
    return response.data;
  },

  // Générer une facture
  async generateInvoice(paymentId: number) {
    const response = await api.post(`/invoices/generate/`, { payment_id: paymentId });
    return response.data;
  }
};