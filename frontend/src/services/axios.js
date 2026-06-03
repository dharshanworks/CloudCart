import axios from 'axios';

const normalizeApiUrl = (value) => {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  // Supports VITE_API_URL=/api when using Vite dev proxy
  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  // Fixes malformed values like :5000/api
  if (trimmed.startsWith(':')) {
    return `${window.location.protocol}//${window.location.hostname}${trimmed}`;
  }

  // Fixes localhost:5000/api (missing protocol)
  if (/^(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/.test(trimmed)) {
    return `${window.location.protocol}//${trimmed}`;
  }

  return trimmed;
};

const configuredApiUrl = normalizeApiUrl(import.meta.env.VITE_API_URL);
const defaultApiUrl = '/api';
const BASE_URL = configuredApiUrl || defaultApiUrl;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => {
    // Log first product from products endpoint for debugging
    if (response.config.url.includes('/products') && !response.config.url.includes('categories')) {
      const firstProduct = response.data?.data?.products?.[0];
      if (firstProduct) {
        console.log('✅ API Response - First product images:', {
          name: firstProduct.name,
          hasImages: 'images' in firstProduct,
          imagesValue: firstProduct.images,
          imagesLength: firstProduct.images?.length
        });
      }
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
