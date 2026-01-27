/**
 * Authentication Storage Utilities
 * Handle secure storage of authentication tokens
 */

const AUTH_TOKEN_KEY = 'mis_auth_token';
const REFRESH_TOKEN_KEY = 'mis_refresh_token';
const USER_DATA_KEY = 'mis_user_data';

/**
 * Get authentication token from storage
 */
export const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

/**
 * Set authentication token in storage
 */
export const setAuthToken = (token: string): void => {
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch (error) {
    console.error('Error setting auth token:', error);
  }
};

/**
 * Get refresh token from storage
 */
export const getRefreshToken = (): string | null => {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting refresh token:', error);
    return null;
  }
};

/**
 * Set refresh token in storage
 */
export const setRefreshToken = (token: string): void => {
  try {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  } catch (error) {
    console.error('Error setting refresh token:', error);
  }
};

/**
 * Clear authentication tokens
 */
export const clearAuthToken = (): void => {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
  } catch (error) {
    console.error('Error clearing auth tokens:', error);
  }
};

/**
 * Get user data from storage
 */
export const getUserData = <T = any>(): T | null => {
  try {
    const data = localStorage.getItem(USER_DATA_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

/**
 * Set user data in storage
 */
export const setUserData = <T = any>(data: T): void => {
  try {
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error setting user data:', error);
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => !!getAuthToken();
