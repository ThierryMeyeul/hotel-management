import api from "../api/axios"
import type { Hotel, NearbySearchParams, NearbyHotelResponse, createHotel, HotelImage, UpdateRoomData, CreateRoomData, HotelUpdateForm } from "../types/hotel";
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
    },

    async getDirectorHotels() {
        try {
            const response = await api.get('/hotels/my-hotels/')
            return response.data
        } catch (error: any) {
            throw new Error(error.response?.data?.detail || "Erreur lors de la création de l'hôtel");
        }
    },
    
    async updateHotelStatus(id: number, is_active: boolean): Promise<Hotel> {
        try {
            const response = await api.patch(`/hotels/${id}/`, {
                is_active: is_active
            });
            return response.data
        } catch (error: any) {
            throw new Error(error.response?.data?.detail || "Erreur lors de la création de l'hôtel");
        }
    },

    async addHotelImage(hotelId: number, imageData: FormData): Promise<HotelImage> {
        try {
            const response = await api.post(`/hotels/${hotelId}/images/`, imageData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data
        } catch (error: any) {
            throw new Error(error.response?.data?.detail || "Erreur lors de la création de l'hôtel");
        }
    },

    async deleteHotelImage(hotelId: number, id: number) {
        try {
            const response = await api.delete(`/hotels/${hotelId}/images/${id}/`, );
            return response.data
        } catch (error: any) {
            throw new Error(error.response?.data?.detail || "Erreur lors de la création de l'hôtel");
        }
    },

    async getRoomById(hotelId: number, id: number) {
        try {
            const response = await api.get(`/hotels/${hotelId}/rooms/${id}/`, );
            return response.data
        } catch (error: any) {
            throw new Error(error.response?.data?.detail || "Erreur lors de la création de l'hôtel");
        }
    },

    async updateRoom(hotelId: number, id: number, roomData: UpdateRoomData) {
        try {
            const response = await api.put(`/hotels/${hotelId}/rooms/${id}/`, roomData);
            return response.data
        } catch (error: any) {
            throw new Error(error.response?.data?.detail || "Erreur lors de la création de l'hôtel");
        }
    },

    async createRoom(hotelId: number, roomData: CreateRoomData) {
        try {
            const response = await api.post(`/hotels/${hotelId}/rooms/`, roomData);
            return response.data
        } catch (error: any) {
            throw new Error(error.response?.data?.detail || "Erreur lors de la création de l'hôtel");
        }
    },

    async updateHotel(id: number, hotelData: HotelUpdateForm) {
        try {
            const response = await api.patch(`/hotels/${id}/`, hotelData);
            return response.data
        } catch (error: any) {
            throw new Error(error.response?.data?.detail || "Erreur lors de la création de l'hôtel");
        }
    }
};