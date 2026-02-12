import api from '../api/axios';
import type { Review } from '../types/review';

export interface CreateReviewData {
  hotel: number;
  rating: number;
  comment: string;
  reservation_id?: number;
}

export interface UpdateReviewData {
  rating?: number;
  comment?: string;
}

class ReviewService {
  /**
   * Récupérer tous les avis de l'utilisateur connecté
   */
  async getMyReviews(): Promise<Review[]> {
    const response = await api.get('/reviews/my-reviews/');
    return response.data;
  }

  /**
   * Vérifier si l'utilisateur peut laisser un avis pour un hôtel spécifique
   */
  async canReviewHotel(hotelId: number): Promise<{
    can_review: boolean;
    existing_review?: Review;
    eligible_reservations?: any[];
  }> {
    const response = await api.get(`/reviews/can-review/${hotelId}/`);
    return response.data;
  }

  /**
   * Créer un nouvel avis
   */
  async createReview(data: CreateReviewData): Promise<Review> {
    const response = await api.post('/reviews/', data);
    return response.data;
  }

  /**
   * Mettre à jour un avis existant
   */
  async updateReview(reviewId: number, data: UpdateReviewData): Promise<Review> {
    const response = await api.patch(`/reviews/${reviewId}/`, data);
    return response.data;
  }

  /**
   * Supprimer un avis
   */
  async deleteReview(reviewId: number): Promise<void> {
    await api.delete(`/reviews/${reviewId}/`);
  }

  /**
   * Récupérer les avis d'un hôtel
   */
  async getHotelReviews(hotelId: number): Promise<Review[]> {
    const response = await api.get(`/reviews/hotel/${hotelId}/`);
    return response.data;
  }

  /**
   * Récupérer les réservations éligibles pour laisser un avis
   */
  async getEligibleReservations(): Promise<any[]> {
    const response = await api.get('/reviews/eligible-reservations/');
    return response.data;
  }
}

export const reviewService = new ReviewService();