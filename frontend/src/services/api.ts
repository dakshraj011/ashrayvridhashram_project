import axios from 'axios';

// Support VITE_API_URL if configured for separate frontend/backend deployments
const RAW_API_URL = import.meta.env.VITE_API_URL || '';
export const API_ROOT = RAW_API_URL.replace(/\/$/, '');
export const API_BASE = API_ROOT ? `${API_ROOT}/api` : '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to resolve static/uploaded asset URLs seamlessly across local and production
export const getAssetUrl = (url?: string): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }
  return API_ROOT ? `${API_ROOT}${url}` : url;
};

// Interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('aashray_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to handle session expiry or unauthorized access gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Only clear and redirect if we are on a protected dashboard page
      const publicPaths = [
        '/',
        '/about',
        '/needs',
        '/events',
        '/contact',
        '/login',
        '/register',
        '/meal-sponsorship',
        '/volunteer-register',
        '/elderly-assistance'
      ];
      
      const currentPath = window.location.pathname;
      const isPublic = publicPaths.includes(currentPath);

      if (!isPublic) {
        localStorage.removeItem('aashray_token');
        sessionStorage.removeItem('admin_pwd_verified');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
