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
    if (typeof window !== 'undefined') {
      window.location.href = '/unauthorized';
    }
  }

  return Promise.reject(error);
};

callAPiMultiPart.interceptors.request.use(requestInterceptor, requestErrorInterceptor);
callAPi.interceptors.request.use(requestInterceptor, requestErrorInterceptor);

callAPi.interceptors.response.use((response) => response, responseErrorInterceptor);
callAPiMultiPart.interceptors.response.use((response) => response, responseErrorInterceptor);
