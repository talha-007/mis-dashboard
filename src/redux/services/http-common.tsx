import axios, { type InternalAxiosRequestConfig } from 'axios';

import { getAuthToken } from 'src/utils/auth-storage';

import ENV from 'src/config/environment';

export const API_URL = ENV.API.BASE_URL || 'http://localhost:3000';
export const IMAGE_BASEURL = `${API_URL}/`;

export const callAPi = axios.create({
  withCredentials: true,
  baseURL: API_URL,
  timeout: ENV.API.TIMEOUT,
  headers: {
    'Content-type': 'application/json',
  },
});

export const callAPiMultiPart = axios.create({
  baseURL: API_URL,
  timeout: ENV.API.TIMEOUT,
  headers: {
    'Content-type': 'multipart/form-data',
  },
});

// Request interceptors
const requestInterceptor = (config: InternalAxiosRequestConfig) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

const requestErrorInterceptor = (error: any) => Promise.reject(error);

// Response interceptor - handle errors with toast notifications
const responseErrorInterceptor = async (error: any) => {
  const { response } = error;

  // 401 Unauthorized - show error toast, don't logout
  if (response?.status === 401) {
    console.warn('[API] 401 Unauthorized');
  }

  // 403 Forbidden - redirect to unauthorized
  if (response?.status === 403) {
    console.warn('[API] 403 Forbidden - access denied');

    // IMPORTANT:
    // When the app boots we call `/api/users/me` (and sometimes `/api/customers/me`)
    // inside `initializeAuth()`. If those endpoints return 403 and we hard-redirect
    // here, the app reloads, re-calls `/me`, and we end up in an infinite redirect loop.
    //
    // To avoid that, we SKIP the global 403 redirect for the `/me` endpoints and let
    // the auth initializer fall back to unauthenticated state (showing the sign‑in page).
    const url: string = response.config?.url ?? '';
    const isMeEndpoint =
      url.includes('/api/users/me') ||
      url.includes('/api/customers/me') ||
      url.includes('/api/v1/me');

    if (!isMeEndpoint && typeof window !== 'undefined') {
      window.location.href = '/unauthorized';
    }
  }

  return Promise.reject(error);
};

callAPiMultiPart.interceptors.request.use(requestInterceptor, requestErrorInterceptor);
callAPi.interceptors.request.use(requestInterceptor, requestErrorInterceptor);

callAPi.interceptors.response.use((response) => response, responseErrorInterceptor);
callAPiMultiPart.interceptors.response.use((response) => response, responseErrorInterceptor);
