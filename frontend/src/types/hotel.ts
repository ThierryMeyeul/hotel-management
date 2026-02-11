export interface Hotel {
  id: number;
  name: string;
  description: string;
  address: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  website: string;
  image_url: string;
  latitude: number;
  longitude: number;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  distance: number ;
  manager_id?: number;
  manager?: any | null; 
  created_at: string;
  updated_at: string;
  is_active: boolean;
  rooms?: Room[];
  images: HotelImage[];
  is_favorite?: boolean;
  total_favorites?: number;
}

export interface NearbySearchParams {
  latitude: number;
  longitude: number;
  radius?: number;
  maxResults?: number;
}

export interface NearbyHotelResponse {
  count: number;
  user_location: {
    latitude: number;
    longitude: number;
  };
  search_radius_km: number;
  results: Hotel[]
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  country?: string;
  city?: string;
  address?: {
    country: string;
    city: string;
    town?: string;
    village?: string;
    state?: string;
    postcode?: string;
    road?: string;
  };
}

export interface GeolocationError {
  code: number;
  message: string;
}

export interface Room {
  id: number;
  room_number: string;
  room_type: string;
  price_per_night: string;
  is_available: boolean;
  capacity?: number;
  description?: string;
  amenities?: string[];
  size: number;
}

export interface CreateRoomData {
  hotel: number;
  room_number: string;
  room_type: string;
  price_per_night: number;
  capacity: number;
  size: string;
  description: string;
  amenities: string[];
  is_available: boolean;
}

export interface UpdateRoomData extends Partial<CreateRoomData> {}

export interface HotelImage {
  id: number;
  image: string;
  caption?: string;
  is_cover: boolean;
}

export interface createHotel {
  name: string;
  description: string;
  address: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  website: string;
  latitude: number;
  longitude: number;
  manager_id?: number;
  is_active: boolean;
}

export type HotelUpdateForm = {
  name: string;
  address: string;
  description: string;
  city: string;
  country: string;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  is_active: boolean;
};
