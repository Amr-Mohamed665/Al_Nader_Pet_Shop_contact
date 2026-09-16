import axios, { type InternalAxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://alnaderpetshopaddressphone-production.up.railway.app/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = Cookies.get('pet-shop-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor — handle 401 globally
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      Cookies.remove('pet-shop-token');
      Cookies.remove('pet-shop-user');
      if (typeof window !== 'undefined') {
        const pathname = window.location.pathname;
        const isProtectedRoute = 
          pathname.startsWith('/admin') ||
          pathname.startsWith('/profile') ||
          pathname.startsWith('/orders') ||
          pathname.startsWith('/checkout');

        if (isProtectedRoute) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
