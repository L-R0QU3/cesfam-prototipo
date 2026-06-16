import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Agregar token JWT en cada request si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cesfam_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Manejar errores globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('cesfam_token');
      localStorage.removeItem('cesfam_user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default api;