import axios, { type InternalAxiosRequestConfig } from 'axios';

import {
  getAuthToken,
  getRefreshToken,
  isTokenNearExpiry,
  setAuthSessionTokens,
  clearAuthToken,
} from 'src/utils/auth-storage';

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

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
  _skipAuthRefresh?: boolean;
};

let refreshInProgress: Promise<string | null> | null = null;

const resolveLoginPathByRole = () => {
  try {
    const raw = localStorage.getItem('userData');
    const user = raw ? JSON.parse(raw) : null;
    const role = user?.role;
    if (role === 'superadmin') return '/sign-in/superadmin';
    if (role === 'admin') return '/sign-in/admin';
    return '/sign-in';
  } catch {
    return '/sign-in';
  }
};

const clearSessionAndRedirect = () => {
  try {
    clearAuthToken();
    if (typeof window !== 'undefined') {
      window.location.href = resolveLoginPathByRole();
    }
  } catch {
    // no-op: avoid crashing interceptor path
  }
};

const extractRefreshPayload = (payload: any) => {
  const data = payload?.data ?? payload;
  return {
    token: data?.token as string | undefined,
    refreshToken: data?.refreshToken as string | undefined,
    expiresAt: (data?.expiresAt ?? data?.expiresIn) as string | number | undefined,
    tokenType: data?.tokenType as string | undefined,
  };
};

const performTokenRefresh = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  const response = await axios.post(
    `${API_URL}/api/auth/refresh-token`,
    { refreshToken },
    {
      withCredentials: true,
      timeout: ENV.API.TIMEOUT,
      headers: { 'Content-type': 'application/json' },
    }
  );
  const next = extractRefreshPayload(response?.data);
  if (!next.token) return null;
  setAuthSessionTokens({
    token: next.token,
    refreshToken: next.refreshToken || refreshToken,
    expiresAt: next.expiresAt,
    tokenType: next.tokenType,
  });
  return next.token;
};

const getFreshAccessToken = async (): Promise<string | null> => {
  if (refreshInProgress) return refreshInProgress;
  refreshInProgress = performTokenRefresh()
    .catch(() => null)
    .finally(() => {
      refreshInProgress = null;
    });
  return refreshInProgress;
};

// Request interceptors
const requestInterceptor = async (config: InternalAxiosRequestConfig) => {
  const req = config as RetryableRequestConfig;
  let token = getAuthToken();
  if (!req._skipAuthRefresh && token && isTokenNearExpiry(60)) {
    const refreshed = await getFreshAccessToken();
    token = refreshed || getAuthToken();
    if (!token) {
      clearSessionAndRedirect();
      return Promise.reject(new Error('Session expired'));
    }
  }
  if (token) {
    req.headers = req.headers ?? {};
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
};

const requestErrorInterceptor = (error: any) => Promise.reject(error);

// Response interceptor - handle errors with toast notifications
const responseErrorInterceptor = async (error: any) => {
  const { response } = error;
  const originalRequest = error?.config as RetryableRequestConfig | undefined;

  if (response?.status === 401 && originalRequest && !originalRequest._retry) {
    originalRequest._retry = true;
    const refreshedToken = await getFreshAccessToken();
    if (refreshedToken) {
      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${refreshedToken}`;
      if ((originalRequest.baseURL ?? '') === callAPiMultiPart.defaults.baseURL) {
        return callAPiMultiPart(originalRequest);
      }
      return callAPi(originalRequest);
    }
    clearSessionAndRedirect();
    return Promise.reject(error);
  }

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
