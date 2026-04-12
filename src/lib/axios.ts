import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { message } from 'antd';
import { API_CONFIG } from '@/config/api.config';

const apiClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Rutas que no requieren token
const PUBLIC_PATHS = ['/auth/login', '/auth/initialize', '/register', '/system/public-info'];

// Request interceptor: attach Bearer token (excepto rutas publicas)
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const isPublic = PUBLIC_PATHS.some((p) => config.url?.includes(p));
    if (!isPublic) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Track rate limit to avoid spamming toasts
let rateLimitToastShown = false;

// Response interceptor: handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ success: boolean; message: string; errors?: Record<string, string[]> }>) => {
    const status = error.response?.status;

    if (status === 401) {
      // No redirigir si es una ruta publica (login, register, public-info, lookup)
      const publicPaths = ['/auth/login', '/register', '/system/public-info', '/lookup/'];
      const requestUrl = error.config?.url || '';
      const isPublicRequest = publicPaths.some((p) => requestUrl.includes(p));

      if (!isPublicRequest) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        if (window.location.pathname !== '/login' && window.location.pathname !== '/registro') {
          window.location.href = '/login';
        }
      }
    }

    if (status === 429 && !rateLimitToastShown) {
      rateLimitToastShown = true;
      const retryAfter = error.response?.headers?.['retry-after'];
      const seconds = retryAfter ? parseInt(retryAfter, 10) : 60;
      message.warning(`Demasiadas solicitudes. Espere ${seconds} segundos.`, 5);
      setTimeout(() => { rateLimitToastShown = false; }, seconds * 1000);
    }

    if (status === 403) {
      message.error(error.response?.data?.message || 'No tiene permisos para esta accion.');
    }

    if (status === 500) {
      message.error('Error interno del servidor. Intente nuevamente.');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
