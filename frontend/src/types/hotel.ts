export interface Hotel {
  id: string;
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
  distance: number;
  manager_id?: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
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
}

export interface HotelImage {
  id: number;
  image_url: string;
  caption?: string;
  is_cover: boolean;
}

export interface HotelDetails extends Hotel {
  images: HotelImage[];
  rooms: Room[];
}