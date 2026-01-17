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
  latitude?: number;
  longitude?: number;
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  distance: number;
  managerId?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
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