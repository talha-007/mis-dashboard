import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';

import type { User, LoginCredentials, AuthResponse, UserRole, RegisterData } from 'src/types/auth.types';

import authService from '../services/auth.services';
import { setAuthToken, getAuthToken, clearAuthToken, setUserData, getUserData } from 'src/utils/auth-storage';

// Socket service will be imported dynamically to avoid circular dependencies
let socketService: any = null;

// Initialize socket service lazily
const getSocketService = async () => {
  if (!socketService) {
    const { socketService: service } = await import('src/services/socket');
    socketService = service;
  }
  return socketService;
};

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  isLoggingIn: boolean;
}

// Initialize state from localStorage
const storedToken = getAuthToken();
const storedUser = getUserData<User>();

const initialState: AuthState = {
  user: storedUser,
  token: storedToken,
  isAuthenticated: !!(storedToken && storedUser),
  isLoading: false,
  error: null,
  isInitialized: false,
  isLoggingIn: false,
};

// Async thunks
export const superAdminLogin = createAsyncThunk(
  'auth/superAdminLogin',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.superAdminLogin(credentials);
      const data = response.data?.data || response.data;
      console.log('data', data);
      // Store tokens
      if (data.token) {
        setAuthToken(data.token);
      }
      if (data.user) {
        setUserData(data.user);
      }

      // Connect socket with auth token
      if (data.token) {
        const socket = await getSocketService();
        socket.updateAuth(data.token);
        socket.connect();
      }

      return {
        user: data.user,
        token: data.token,
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Super Admin login failed'
      );
    }
  }
);

export const adminLogin = createAsyncThunk(
  'auth/adminLogin',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.adminLogin(credentials);
      const data = response.data?.data || response.data;

      // Store tokens
      if (data.token) {
        setAuthToken(data.token);
      }
      if (data.user) {
        setUserData(data.user);
      }

      // Connect socket with auth token
      if (data.token) {
        const socket = await getSocketService();
        socket.updateAuth(data.token);
        socket.connect();
      }

      return {
        user: data.user,
        token: data.token,
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Admin login failed'
      );
    }
  }
);

export const userLogin = createAsyncThunk(
  'auth/userLogin',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.userLogin(credentials);
      const data = response.data?.data || response.data;

      // Store tokens
      if (data.token) {
        setAuthToken(data.token);
      }
      if (data.user) {
        setUserData(data.user);
      }

      // Connect socket with auth token
      if (data.token) {
        const socket = await getSocketService();
        socket.updateAuth(data.token);
        socket.connect();
      }

      return {
        user: data.user,
        token: data.token,
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'User login failed'
      );
    }
  }
);

// Google Login (Customer)
export const googleLogin = createAsyncThunk(
  'auth/googleLogin',
  async (data: { idToken: string }, { rejectWithValue }) => {
    try {
      const response = await authService.googleLogin(data);
      const resp = response.data?.data || response.data;

      if (resp.token) {
        setAuthToken(resp.token);
      }
      if (resp.user) {
        setUserData(resp.user);
      }

      if (resp.token) {
        const socket = await getSocketService();
        socket.updateAuth(resp.token);
        socket.connect();
      }

      return {
        user: resp.user,
        token: resp.token,
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Google login failed'
      );
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (data: RegisterData, { rejectWithValue }) => {
    try {
      const response = await authService.register(data);
      const responseData = response.data?.data || response.data;

      // Store tokens if provided
      if (responseData.token) {
        setAuthToken(responseData.token);
      }
      if (responseData.user) {
        setUserData(responseData.user);
      }

      // Connect socket with auth token if available
      if (responseData.token) {
        const socket = await getSocketService();
        socket.updateAuth(responseData.token);
        socket.connect();
      }

      return {
        user: responseData.user,
        token: responseData.token,
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Registration failed'
      );
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async (data?: any, { rejectWithValue } = {} as any) => {
  try {
    await authService.logout(data || {});
    clearAuthToken();

    // Disconnect socket
    const socket = await getSocketService();
    socket.disconnect();

    return null;
  } catch (error: any) {
    // Even if API call fails, clear local data
    clearAuthToken();
    const socket = await getSocketService();
    socket.disconnect();
    return rejectWithValue(error.message || 'Logout failed');
  }
});

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getCurrentUser({});
      const data = response.data?.data || response.data;
      setUserData(data);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get user');
    }
  }
);

/**
 * Initialize auth state on app startup
 * Restores session from localStorage and (optionally) validates with backend
 */
export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async () => {
    try {
      const token = getAuthToken();
      const storedUser = getUserData<User>();

      if (!token) {
        return null;
      }

      // If we already have user data in localStorage, trust it and reconnect socket.
      if (storedUser) {
        const socket = await getSocketService();
        socket.updateAuth(token);
        socket.connect();
        return { user: storedUser, token };
      }

      // Fallback: try to fetch current user from backend when userData is missing
      const response = await authService.getCurrentUser({});
      const data = response.data?.data || response.data;
      setUserData(data);

      const socket = await getSocketService();
      socket.updateAuth(token);
      socket.connect();

      return { user: data, token };
    } catch (error: any) {
      // Backend validation failed or network error.
      // Do NOT clear token or local state – just signal "no update".
      return null;
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
      state.isLoggingIn = false;
      clearAuthToken();
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
    setLoggingIn: (state, action: PayloadAction<boolean>) => {
      state.isLoggingIn = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Super Admin Login
    builder
      .addCase(superAdminLogin.pending, (state) => {
        state.isLoggingIn = true;
        state.error = null;
      })
      .addCase(superAdminLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isLoggingIn = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(superAdminLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.isLoggingIn = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Admin Login
    builder
      .addCase(adminLogin.pending, (state) => {
        state.isLoading = true;
        state.isLoggingIn = true;
        state.error = null;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isLoggingIn = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.isLoggingIn = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // User/Customer Login
    builder
      .addCase(userLogin.pending, (state) => {
        state.isLoading = true;
        state.isLoggingIn = true;
        state.error = null;
      })
      .addCase(userLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isLoggingIn = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(userLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.isLoggingIn = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Google Login
    builder
      .addCase(googleLogin.pending, (state) => {
        state.isLoading = true;
        state.isLoggingIn = true;
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isLoggingIn = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.isLoggingIn = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Register
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.isLoggingIn = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isLoggingIn = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isLoggingIn = false;
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
        state.isLoggingIn = false;
      })
      .addCase(logout.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isLoggingIn = false;
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

    // Initialize Auth
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        // If payload has fresh user/token, update; otherwise keep existing state
        if (action.payload) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
        }
        state.error = null;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.isLoading = false;
        state.isInitialized = true;
        // On error, keep whatever auth state we already had (derived from localStorage).
      });
  },
});

export const {
  setUser,
  clearAuth,
  setError,
  clearError,
  setInitialized,
  updateToken,
  setLoggingIn,
} = authSlice.actions;

export default authSlice.reducer;
