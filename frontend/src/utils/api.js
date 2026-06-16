import axios from 'axios';

// Usar baseURL relativa en producción, o la URL de desarrollo si está definida
const baseURL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor de request (token JWT)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cesfam_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de respuesta (manejo de 401)
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