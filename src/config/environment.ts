/**
 * Environment Configuration
 * Centralized configuration for environment variables
 */

export const ENV = {
  // API Configuration
  API: {
    BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
    TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
  },

  // WebSocket Configuration
  SOCKET: {
    URL: import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000',
    PATH: import.meta.env.VITE_SOCKET_PATH || '/socket.io',
    RECONNECTION_ATTEMPTS: Number(import.meta.env.VITE_SOCKET_RECONNECTION_ATTEMPTS) || 5,
    RECONNECTION_DELAY: Number(import.meta.env.VITE_SOCKET_RECONNECTION_DELAY) || 3000,
  },

  // App Configuration
  APP: {
    NAME: import.meta.env.VITE_APP_NAME || 'MIS Dashboard',
    VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
    ENV: import.meta.env.VITE_APP_ENV || 'development',
  },

  // Feature Flags
  FEATURES: {
    REAL_TIME: import.meta.env.VITE_ENABLE_REAL_TIME === 'true',
    NOTIFICATIONS: import.meta.env.VITE_ENABLE_NOTIFICATIONS === 'true',
    ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  },

  // Development flags
  DEV: {
    BYPASS_AUTH: import.meta.env.VITE_BYPASS_AUTH === 'true',
    MOCK_USER: import.meta.env.VITE_MOCK_USER || 'superadmin',
  },

  // Derived flags
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
} as const;

export default ENV;
