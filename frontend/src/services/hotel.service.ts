import api from "../api/axios"
import type { Hotel, NearbySearchParams, NearbyHotelResponse, createHotel } from "../types/hotel";
import { getAccess } from "./auth.service";


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

    async getHotelDetails(id: number): Promise<Hotel> {
        try {
            const response = await api.get<Hotel>(`hotels/${id}/`)
            return response.data
        } catch (error: any) {
            throw new Error(error.response?.data?.detail || 'Erreur lors du chargement des détails de l\'hôtel');
        }
    },

    async createHotel(data: createHotel): Promise<Hotel> {
        try {
            const accessToken = getAccess(); // retourne ton token string
            const response = await api.post<Hotel>(
                'hotels/',
                data, // <-- ici ton objet directement
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    }
                }
            );
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.detail || "Erreur lors de la création de l'hôtel");
        }
    },

    async getHotelsWithoutManager(): Promise<Hotel[]> {
        try {
            const response = await api.get<Hotel[]>('/hotels/no-manager/')
            return response.data
        } catch (error: any) {
            throw new Error(error.response?.data?.detail || "Erreur lors de la création de l'hôtel");
        }
    },

    async assignManagerToHotel(hotelId: number, managerId: number): Promise<Hotel> {
        try {
            const response = await api.post(`/hotels/${hotelId}/assign_manager/`, {
                user_id: managerId
            });
            return response.data
        } catch (error: any) {
            throw new Error(error.response?.data?.detail || "Erreur lors de la création de l'hôtel");
        }
    }

};