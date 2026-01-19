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
}