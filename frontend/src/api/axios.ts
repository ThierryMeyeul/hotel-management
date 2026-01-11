import axios from 'axios';

const base = import.meta.env.VITE_API_BASE_URL || '/api/';

const api = axios.create({
  baseURL: base,
  headers: {
    'Content-Type': 'application/json',
  },// Include cookies for cross-origin requests
});

api.interceptors.request.use((config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}));

export default api;