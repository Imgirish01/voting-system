import axios from 'axios';
import { handleFallbackRequest } from './localFallback';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api` : '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor with graceful 404/offline fallback
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // If backend returns 404 (common on static Vercel deploys) or network fails
    if (error.response?.status === 404 || !error.response || error.code === 'ERR_NETWORK') {
      try {
        const fallbackResult = handleFallbackRequest(error.config);
        if (fallbackResult) {
          return fallbackResult;
        }
      } catch (fallbackErr) {
        console.warn('Fallback error:', fallbackErr);
      }
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred while communicating with the Election Server.';
    return Promise.reject(new Error(message));
  }
);

export default api;
