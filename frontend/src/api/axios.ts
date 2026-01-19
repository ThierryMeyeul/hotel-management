import axios from 'axios';
import { getAccess } from '../services/auth.service';

const base = import.meta.env.VITE_API_BASE_URL || '/api/';

const api = axios.create({
  baseURL: base,
  headers: {
    'Content-Type': 'application/json',
  },// Include cookies for cross-origin requests
});

api.interceptors.request.use((config => {
  const token = getAccess();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}));

export default api;