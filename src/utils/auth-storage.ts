/**
 * Authentication Storage Utilities
 * Handle secure storage of authentication tokens
 */

const AUTH_TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refreshToken';
const EXPIRES_AT_KEY = 'expiresAt';
const TOKEN_TYPE_KEY = 'tokenType';
const USER_DATA_KEY = 'userData';
const BANK_DATA_KEY = 'bankData';

export type AuthSessionTokens = {
  token: string;
  refreshToken?: string;
  expiresAt?: string | number;
  tokenType?: string;
};

function toEpochMs(value: string | number | null | undefined): number | null {
  if (value == null || value === '') return null;
  if (typeof value === 'number') {
    // If backend sends seconds, normalize to ms.
    return value < 10_000_000_000 ? value * 1000 : value;
  }
  const asNum = Number(value);
  if (!Number.isNaN(asNum) && value.trim() !== '') {
    return asNum < 10_000_000_000 ? asNum * 1000 : asNum;
  }
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
}

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

export const getRefreshToken = (): string | null => {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting refresh token:', error);
    return null;
  }
};

export const getTokenExpiry = (): string | null => {
  try {
    return localStorage.getItem(EXPIRES_AT_KEY);
  } catch (error) {
    console.error('Error getting token expiry:', error);
    return null;
  }
};

export const getTokenType = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_TYPE_KEY);
  } catch (error) {
    console.error('Error getting token type:', error);
    return null;
  }
};

export const setAuthSessionTokens = (session: AuthSessionTokens): void => {
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, session.token);
    if (session.refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
    if (session.expiresAt != null) localStorage.setItem(EXPIRES_AT_KEY, String(session.expiresAt));
    if (session.tokenType) localStorage.setItem(TOKEN_TYPE_KEY, session.tokenType);
  } catch (error) {
    console.error('Error setting auth session tokens:', error);
  }
};

export const isTokenNearExpiry = (bufferSeconds = 60): boolean => {
  try {
    const token = getAuthToken();
    if (!token) return true;
    const expiresAt = getTokenExpiry();
    const expiresAtMs = toEpochMs(expiresAt);
    if (!expiresAtMs) return false;
    return Date.now() >= expiresAtMs - bufferSeconds * 1000;
  } catch {
    return false;
  }
};

/**
 * Clear authentication tokens
 */
export const clearAuthToken = (): void => {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(EXPIRES_AT_KEY);
    localStorage.removeItem(TOKEN_TYPE_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    localStorage.removeItem(BANK_DATA_KEY);
  } catch (error) {
    console.error('Error clearing auth tokens:', error);
  }
};

/**
 * Get bank data from storage (from /me for bank admin)
 */
export const getBankData = <T = any>(): T | null => {
  try {
    const data = localStorage.getItem(BANK_DATA_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting bank data:', error);
    return null;
  }
};

/** Get bank slug from storage (checks bankData, userData, and direct bankSlug key) */
export const getBankSlugFromStorage = (): string | null => {
  try {
    const direct = localStorage.getItem('bankSlug');
    if (direct) return direct;
    const bankData = getBankData<{ slug?: string; bankSlug?: string }>();
    if (bankData?.slug) return bankData.slug;
    if (bankData?.bankSlug) return bankData.bankSlug;
    const userData = getUserData<{ bankSlug?: string }>();
    if (userData?.bankSlug) return userData.bankSlug;
    return null;
  } catch {
    return null;
  }
};

/**
 * Set bank data in storage
 */
export const setBankData = <T = any>(data: T): void => {
  try {
    localStorage.setItem(BANK_DATA_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error setting bank data:', error);
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
