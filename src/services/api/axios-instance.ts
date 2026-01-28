/**
 * Axios Instance Configuration
 * Configured with interceptors for request/response handling
 */

import type { AxiosError, AxiosResponse, AxiosRequestConfig } from 'axios';

import axios from 'axios';

import { getAuthToken, setAuthToken, clearAuthToken, getRefreshToken, setRefreshToken } from 'src/utils/auth-storage';

import ENV from 'src/config/environment';

import type { ApiError, ApiResponse } from './types';

// Store reference will be set later to avoid circular dependency
let storeDispatch: any = null;

export const setStoreDispatch = (dispatch: any) => {
  storeDispatch = dispatch;
};

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: ENV.API.BASE_URL,
  timeout: ENV.API.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Add authentication token if available
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request timestamp for logging
    if (ENV.IS_DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
      });
    }

    return config;
  },
  (error) => {
    if (ENV.IS_DEV) {
      console.error('[API Request Error]', error);
    }
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    // Log successful responses in development
    if (ENV.IS_DEV) {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }

    return response;
  },
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Log errors in development
    if (ENV.IS_DEV) {
      console.error('[API Response Error]', {
        url: error.config?.url,
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
      });
    }

    // Handle 401 Unauthorized - Token expired or invalid
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Try to refresh token first
      const refreshToken = getRefreshToken();
      
      if (refreshToken) {
        try {
          // Attempt token refresh
          const response = await axios.post<ApiResponse<{ token: string; refreshToken: string }>>(
            `${ENV.API.BASE_URL}/auth/refresh`,
            { refreshToken }
          );
          
          const newToken = response.data.data.token;
          const newRefreshToken = response.data.data.refreshToken;
          
          // Store new tokens in localStorage
          setAuthToken(newToken);
          if (newRefreshToken) {
            setRefreshToken(newRefreshToken);
          }
          
          // CRITICAL: Update Redux state with new token to keep state synchronized
          // This ensures socket provider and other components use the refreshed token
          if (storeDispatch) {
            const { updateToken } = await import('src/store/slices/auth.slice');
            storeDispatch(updateToken(newToken));
          }
          
          // Update original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          
          // Retry original request
          return axiosInstance(originalRequest);
        } catch {
          // Refresh failed, clear auth and redirect
          clearAuthToken();
          
          // Dispatch logout action if store is available
          if (storeDispatch) {
            const { clearAuth } = await import('src/store/slices/auth.slice');
            storeDispatch(clearAuth());
          }
          
          // Redirect to login
          if (typeof window !== 'undefined') {
            window.location.href = '/sign-in';
          }
          
          return Promise.reject(error);
        }
      } else {
        // No refresh token, clear auth and redirect
        clearAuthToken();
        
        // Dispatch logout action if store is available
        if (storeDispatch) {
          const { clearAuth } = await import('src/store/slices/auth.slice');
          storeDispatch(clearAuth());
        }
        
        // Redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/sign-in';
        }
        
        return Promise.reject(error);
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('[API] Access forbidden:', error.response.data?.message);
    }

    // Handle 500 Internal Server Error
    if (error.response?.status === 500) {
      console.error('[API] Server error:', error.response.data?.message);
    }

    // Transform error for consistent handling
    const apiError: ApiError = {
      message: error.response?.data?.message || error.message || 'An unexpected error occurred',
      status: error.response?.status,
      code: error.code,
      errors: error.response?.data?.errors,
    };

    return Promise.reject(apiError);
  }
);

export default axiosInstance;
