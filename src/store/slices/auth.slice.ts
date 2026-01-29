/**
 * Authentication Redux Slice
 * Manages authentication state and user data
 */

import type { PayloadAction } from '@reduxjs/toolkit';
import type {
  User,
  RegisterData,
  LoginCredentials,
  GoogleLoginCredentials,
} from 'src/types/auth.types';

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { MOCK_TOKEN, getMockUser } from 'src/utils/mock-auth';
import { setUserData, getUserData, setAuthToken, getAuthToken, clearAuthToken, setRefreshToken } from 'src/utils/auth-storage';

import ENV from 'src/config/environment';
import { authService } from 'src/services/api';
import { socketService } from 'src/services/socket';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

// Initialize state from localStorage or use mock data in dev mode
const storedToken = getAuthToken();
const storedUser = getUserData<User>();

// Use mock data if bypass auth is enabled (for development without backend)
const mockUser = ENV.DEV.BYPASS_AUTH ? getMockUser(ENV.DEV.MOCK_USER as 'superadmin' | 'customer') : null;
const mockToken = ENV.DEV.BYPASS_AUTH ? MOCK_TOKEN : null;

const initialState: AuthState = {
  user: ENV.DEV.BYPASS_AUTH ? mockUser : storedUser,
  token: ENV.DEV.BYPASS_AUTH ? mockToken : storedToken,
  isAuthenticated: ENV.DEV.BYPASS_AUTH ? true : !!(storedToken && storedUser),
  isLoading: false,
  error: null,
  isInitialized: ENV.DEV.BYPASS_AUTH ? true : false,
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      
      // Store tokens
      setAuthToken(response.token);
      if (response.refreshToken) {
        setRefreshToken(response.refreshToken);
      }
      setUserData(response.user);

      // Connect socket with auth token
      socketService.updateAuth(response.token);
      socketService.connect();

      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (data: RegisterData, { rejectWithValue }) => {
    try {
      const response = await authService.register(data);
      
      // Store tokens
      setAuthToken(response.token);
      if (response.refreshToken) {
        setRefreshToken(response.refreshToken);
      }
      setUserData(response.user);

      // Connect socket with auth token
      socketService.updateAuth(response.token);
      socketService.connect();

      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
);

export const loginWithGoogle = createAsyncThunk(
  'auth/loginWithGoogle',
  async (credentials: GoogleLoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.loginWithGoogle(credentials);
      
      // Store tokens
      setAuthToken(response.token);
      if (response.refreshToken) {
        setRefreshToken(response.refreshToken);
      }
      setUserData(response.user);

      // Connect socket with auth token
      socketService.updateAuth(response.token);
      socketService.connect();

      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Google login failed');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      clearAuthToken();
      socketService.disconnect();
      return null;
    } catch (error: any) {
      // Even if API call fails, clear local data
      clearAuthToken();
      socketService.disconnect();
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const user = await authService.getCurrentUser();
      setUserData(user);
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get user');
    }
  }
);

/**
 * Initialize auth state on app startup
 * Validates stored token and fetches current user
 * In development mode with BYPASS_AUTH, returns mock data immediately
 */
export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { rejectWithValue }) => {
    try {
      // Bypass auth in development mode
      if (ENV.DEV.BYPASS_AUTH) {
        const user = getMockUser(ENV.DEV.MOCK_USER as 'superadmin' | 'customer');
        const token = MOCK_TOKEN;
        return { user, token };
      }

      const token = getAuthToken();
      
      if (!token) {
        return null;
      }

      // Validate token and get current user
      const user = await authService.getCurrentUser();
      setUserData(user);

      // Reconnect socket if token is valid
      socketService.updateAuth(token);
      socketService.connect();

      return { user, token };
    } catch (error: any) {
      // Token is invalid, clear storage
      clearAuthToken();
      socketService.disconnect();
      return rejectWithValue(error.message || 'Session expired');
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      clearAuthToken();
      socketService.disconnect();
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setInitialized: (state) => {
      state.isInitialized = true;
    },
    updateToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      setAuthToken(action.payload);
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Register
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Logout
    builder
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state) => {
        state.isLoading = false;
        // Clear state even on error
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });

    // Get Current User
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Google Login
    builder
      .addCase(loginWithGoogle.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Initialize Auth
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        if (action.payload) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
        } else {
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
        }
        state.error = null;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export const { setUser, clearAuth, setError, clearError, setInitialized, updateToken } = authSlice.actions;
export default authSlice.reducer;
