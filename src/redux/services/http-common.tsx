// eslint-disable-next-line import/no-extraneous-dependencies
import axios, { type InternalAxiosRequestConfig } from 'axios';

import { getAuthToken } from 'src/utils/auth-storage';

export const API_URL = 'http://localhost:3000';
export const IMAGE_BASEURL = 'http://localhost:3000/';

export const callAPi = axios.create({
  withCredentials: true,
  baseURL: API_URL,
  headers: {
    'Content-type': 'application/json',
  },
});

export const callAPiMultiPart = axios.create({
  baseURL: API_URL,
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

callAPiMultiPart.interceptors.request.use(requestInterceptor, requestErrorInterceptor);
callAPi.interceptors.request.use(requestInterceptor, requestErrorInterceptor);

// Simple response interceptors: just pass responses through and bubble up errors.
callAPi.interceptors.response.use((response) => response, (error) => Promise.reject(error));
callAPiMultiPart.interceptors.response.use((response) => response, (error) => Promise.reject(error));