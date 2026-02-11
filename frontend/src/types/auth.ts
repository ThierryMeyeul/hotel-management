import type { Reservation } from "./booking";
import type { Hotel } from "./hotel";

export interface Tokens {
    access: string;
    refresh: string;
}

export interface Director {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'DIRECTOR';
  phone_number: string;
  is_blocked: boolean;
  hotels?: Hotel[]; // À ajouter si votre API le permet
  is_active?: boolean;       // optionnel
  date_joined?: string; 
  phone?: string | null; 
  created_at?: string;
}

// src/types/index.ts
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'ADMIN' | 'DIRECTOR' | 'CLIENT';
  phone_number?: string;
  is_blocked: boolean;
  date_joined: string;
  last_login?: string;
}

export interface DashboardStats {
  total_users: number;
  active_hotels: number;
  total_bookings: number;
  revenue_last_30_days: number;
  user_change_percentage: number;
  hotel_change_percentage: number;
  booking_change_percentage: number;
  revenue_change_percentage: number;
  total_reservations: Reservation[];
}

export interface ActivityData {
  date: string;
  bookings: number;
  revenue: number;
  new_users: number;
  formattedDate?: string
}

export interface RoleDistribution {
  admin: number;
  director: number;
  client: number;
}

export interface RecentHotel {
  id: number;
  name: string;
  city: string;
  status: string;
  bookings_count: number;
  manager_name: string;
}

export interface RecentBooking {
  id: string;
  hotel_name: string;
  user_name: string;
  amount: number;
  status: string;
  created_at: string;
}