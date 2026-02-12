export interface Review {
  id: number;
  user: number;
  username: string;
  hotel: number;
  hotel_name: string;
  rating: number;
  comment: string;
  reservation?: number;
  created_at: string;
  updated_at: string;
  is_owner?: boolean;
  can_edit?: boolean;
}

export interface ReviewStats {
  average_rating: number;
  total_reviews: number;
  rating_distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}