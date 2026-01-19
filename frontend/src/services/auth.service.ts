import api from "../api/axios"
import type { Tokens, Director } from "../types/auth"
import axios from "axios"


export const login = async (username: string, password: string) => {
  const response = await apiActivate.post('/accounts/login/', {
    username,
    password
  })
  return response.data
}


export const register = async (username: string, password: string, email: string, first_name: string, last_name: string, phone_number: string) => {
  const response = await api.post('/accounts/register/', {
    username,
    password,
    email,
    first_name,
    last_name,
    phone_number
  })
  return response.data
}

export const registerDirector = async (username: string, password: string, email: string, first_name: string, last_name: string, phone_number: string, role: String) => {
  const response = await api.post('/accounts/register/', {
    username,
    password,
    email,
    first_name,
    last_name,
    phone_number,
    role
  })
  return response.data
}

export const getAllDirectors = async(): Promise<Director[]> => {
  const response = await api.get('/accounts/users/directors/')
  return response.data
}

export const deleteUser = async(id: number) => {
  const response = await api.delete(`/accounts/user/${id}`)
  return response.data
}

export const toggleBlockUser = async(id:number, is_blocked: boolean) => {
  const response = await api.patch(`/accounts/users/${id}/`, { is_blocked })
  return response.data
}


export const activateAccount = async (uidb64: string, token: string) => {
  const response = await apiActivate.get(`/accounts/activate/${uidb64}/${token}/`)
  return response.data
}


export const logout = async () => {
  const response = await api.post('/accounts/logout/')
  return response.data
}


export const saveToken = (token: string) => {
  localStorage.setItem('token', JSON.stringify(token));
}

export const getAccess = (): string | null => {
  const token = localStorage.getItem("token");

  if (!token) return null;

  const parsed: Tokens = JSON.parse(token);
  return parsed.access;
};

export const getRefresh = (): string | null => {
  const token = localStorage.getItem("token");

  if (!token) return null;

  const parsed: Tokens = JSON.parse(token);
  return parsed.refresh;
};



export const saveUserInfo = (userInfo: any) => {
  localStorage.setItem('userInfo', JSON.stringify(userInfo));
}

export const getUserInfo = (): any | null => {
  const data = localStorage.getItem('userInfo');
  return data ? JSON.parse(data) : null;
}




const base = import.meta.env.VITE_API_BASE_URL || '/api/';

const apiActivate = axios.create({
  baseURL: base,
  headers: {
    'Content-Type': 'application/json',
  },// Include cookies for cross-origin requests
});

apiActivate.interceptors.request.use((config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}));


