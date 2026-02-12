import api from '../api/axios';
import type { Review } from '../types/review';

export interface ReviewStatistics {
  total_reviews: number;
  average_rating: number;
  rating_distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  reviews_by_hotel: Array<{
    hotel__id: number;
    hotel__name: string;
    count: number;
    average: number;
  }>;
  latest_reviews: Review[];
}

export interface HotelReviewsResponse {
  hotel_id: number;
  hotel_name: string;
  reviews: Review[];
  stats: {
    average_rating: number;
    total_reviews: number;
    rating_distribution: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
  };
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
}

class DirectorReviewService {
  /**
   * Récupérer les statistiques globales des avis
   */
  async getStatistics(): Promise<ReviewStatistics> {
    const response = await api.get('/reviews/director/statistics/');
    return response.data;
  }

  /**
   * Récupérer les avis d'un hôtel spécifique
   */
  async getHotelReviews(
    hotelId: number,
    params?: { 
      page?: number; 
      page_size?: number;
      rating?: number | 'all';
      date_from?: string;
      date_to?: string;
    }
  ): Promise<HotelReviewsResponse> {
    const response = await api.get(`/reviews/director/hotel/${hotelId}/`, { params });
    return response.data;
  }

  /**
   * Exporter les avis d'un hôtel en CSV
   */
  async exportHotelReviews(hotelId: number): Promise<Blob> {
    const response = await api.get(`/reviews/director/export/${hotelId}/`, {
      responseType: 'blob'
    });
    return response.data;
  }
}

export const directorReviewService = new DirectorReviewService();