import api from "../api/axios"
import type { Hotel, NearbySearchParams, NearbyHotelResponse, HotelDetails } from "../types/hotel";


export const hotelService = {
    async getAllHotels(): Promise<Hotel[]> {
        try {
            const response = await api.get<Hotel[]>('/hotels/');
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.detail || 'Failed to fetch hotels');
        }
    },

    async getNearbyHotels(params: NearbySearchParams): Promise<NearbyHotelResponse> {
        try {
            const response = await api.get<NearbyHotelResponse>('/hotels/nearby/', { 
                params: {
                    latitude: params.latitude,
                    longitude: params.longitude,
                    radius: params.radius || 50,
                    max_results: params.maxResults || 20
                }
            });
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.detail || 'Failed to fetch nearby hotels');
        }
    },

    async getHotelDetails(id: number): Promise<HotelDetails> {
        try {
            const response = await api.get<HotelDetails>(`hotels/${id}/`)
            return response.data
        } catch (error: any) {
            throw new Error(error.response?.data?.detail || 'Erreur lors du chargement des détails de l\'hôtel');
        }
    }
};