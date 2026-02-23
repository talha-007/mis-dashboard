import type { User, RegisterData, LoginCredentials } from 'src/types/auth.types';

import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';

import { getCurrentBankSlug } from 'src/utils/bank-context';
import {
  setUserData,
  getUserData,
  setBankData,
  getBankData,
  setAuthToken,
  getAuthToken,
  clearAuthToken,
} from 'src/utils/auth-storage';

import { UserRole, ROLE_PERMISSIONS } from 'src/types/auth.types';

import authService from '../services/auth.services';

/** Bank from /me (for bank admin) */
export interface AuthBank {
  id: string;
  name?: string;
  slug?: string;
  subscriptionStatus?: string;
}

/** Map register/login API customer object to our User type */
function customerToUser(customer: any): User {
  if (!customer || !customer.id) return customer as User;
  const permissions = ROLE_PERMISSIONS[UserRole.CUSTOMER] ?? [];
  return {
    ...customer,
    id: customer.id,
    email: customer.email ?? '',
    firstName: customer.firstName ?? customer.name ?? '',
    lastName: customer.lastName ?? customer.lastname ?? '',
    role: UserRole.CUSTOMER,
    bankSlug: customer.bankSlug ?? customer.slug ?? undefined,
    permissions: Array.isArray(customer.permissions) ? customer.permissions : permissions,
    isActive: customer.isActive ?? true,
    isEmailVerified: customer.isEmailVerified ?? false,
    createdAt: customer.createdAt ?? '',
    updatedAt: customer.updatedAt ?? '',
  };
}

interface AuthState {
  user: User | null;
  bank: AuthBank | null;
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
const storedBank = getBankData<AuthBank>();

const initialState: AuthState = {
  user: storedUser,
  bank: storedBank,
  token: storedToken,
  isAuthenticated: !!(storedToken && storedUser),
  isLoading: false,
  error: null,
  isInitialized: false,
  isLoggingIn: false,
};

// Async thunks
/** Merge /me API response (user + optional bank for subscriptionStatus) into user */
function mergeMeIntoUser(loginUser: any, userData: any, bankData?: any): User {
  if (!loginUser) return loginUser as User;
  const meData = userData ?? loginUser;
  const name =
    (meData.name ?? `${loginUser.firstName ?? ''} ${loginUser.lastName ?? ''}`.trim()) || 'User';
  const [firstName, ...rest] = name.split(' ');
  const lastName = rest.join(' ') || firstName;
  const subscriptionStatus =
    bankData?.subscriptionStatus ?? meData.subscriptionStatus ?? loginUser.subscriptionStatus;

  // Normalize role coming from /me:
  // Backend sends role: "user" for customers, but our app expects "customer".
  let normalizedRole = meData.role ?? loginUser.role;
  if (normalizedRole === 'user') {
    normalizedRole = UserRole.CUSTOMER;
  }

  return {
    ...loginUser,
    id: meData.id ?? loginUser.id,
    email: meData.email ?? loginUser.email,
    firstName: meData.firstName ?? loginUser.firstName ?? firstName,
    lastName: meData.lastName ?? loginUser.lastName ?? lastName,
    role: normalizedRole,
    bankSlug: meData.bankSlug ?? meData.slug ?? loginUser.bankSlug ?? undefined,
    subscriptionStatus,
    permissions: loginUser.permissions ?? [],
    isActive: loginUser.isActive ?? true,
    isEmailVerified: loginUser.isEmailVerified ?? false,
    createdAt: loginUser.createdAt ?? '',
    updatedAt: loginUser.updatedAt ?? '',
  };
}

/**
 * Call /me API: /api/users/me fetches data for all logged-in roles (superadmin, admin, customer).
 */
async function fetchMeApi(): Promise<{ user: User; bank: AuthBank | null } | null> {
  try {
    const response = await authService.getMe();
    const data = response.data?.data ?? response.data;
    if (!data) return null;
    const userData = data.user ?? data;
    const bankData = data.bank ?? null;
    const cached = getUserData<User>();
    const merged = mergeMeIntoUser(cached ?? {}, userData, bankData);
    const bank = bankData?.id
      ? {
          id: bankData.id,
          name: bankData.name,
          slug: bankData.slug,
          subscriptionStatus: bankData.subscriptionStatus,
        }
      : null;
    if (bank) setBankData(bank);
    return { user: merged, bank };
  } catch {
    return null;
  }
}

/** Fetch current user from /me - call after login or to refresh (uses /api/users/me or /api/customers/me for customers) */
export const fetchMe = createAsyncThunk('auth/fetchMe', async (_, { rejectWithValue }) => {
  try {
    const result = await fetchMeApi();
    if (result) {
      setUserData(result.user);
      return result;
    }
    return rejectWithValue('Failed to fetch profile');
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ?? error.message ?? 'Failed to fetch profile'
    );
  }
});

export const superAdminLogin = createAsyncThunk(
  'auth/superAdminLogin',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.superAdminLogin(credentials);
      const data = response.data?.data || response.data;
      if (data.token) setAuthToken(data.token);
      if (data.user) setUserData(data.user);

      let user = data.user as User;
      let bank: AuthBank | null = null;
      try {
        const meRes = await authService.getMe();
        const meData = meRes.data?.data ?? meRes.data;
        if (meData) {
          user = mergeMeIntoUser(user, meData.user ?? meData, meData.bank);
          if (meData.bank?.id) {
            bank = {
              id: meData.bank.id,
              name: meData.bank.name,
              slug: meData.bank.slug,
              subscriptionStatus: meData.bank.subscriptionStatus,
            };
            setBankData(bank);
          }
        }
      } catch {
        // keep login user if /me fails
      }
      setUserData(user);
      return { user, bank, token: data.token };
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
      if (data.token) setAuthToken(data.token);
      if (data.user) setUserData(data.user);

      let user = data.user as User;
      let bank: AuthBank | null = null;
      try {
        const meRes = await authService.getMe();
        const meData = meRes.data?.data ?? meRes.data;
        if (meData) {
          user = mergeMeIntoUser(user, meData.user ?? meData, meData.bank);
          if (meData.bank?.id) {
            bank = {
              id: meData.bank.id,
              name: meData.bank.name,
              slug: meData.bank.slug,
              subscriptionStatus: meData.bank.subscriptionStatus,
            };
            setBankData(bank);
          }
        }
      } catch {
        // keep login user if /me fails
      }
      setUserData(user);
      return { user, bank, token: data.token };
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
      if (data.token) setAuthToken(data.token);

      const rawUser = data.customer ?? data.user;
      let user = rawUser ? customerToUser(rawUser) : null;
      const meResult = await fetchMeApi();
      if (meResult) user = meResult.user;
      if (user) setUserData(user);
      return { user, token: data.token };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'User login failed');
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
      if (resp.token) setAuthToken(resp.token);
      if (resp.user) setUserData(resp.user);

      let user = resp.user as User;
      try {
        const meRes = await authService.getMe();
        const meData = meRes.data?.data ?? meRes.data;
        if (meData) user = mergeMeIntoUser(user, meData.user ?? meData, meData.bank);
      } catch {
        // keep login user if /me fails
      }
      setUserData(user);
      return { user, token: resp.token };
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
      // API expects field "slug" (bank slug) when registering via bank URL
      const slug = data.bankSlug ?? getCurrentBankSlug() ?? undefined;
      const payload = slug ? { ...data, slug } : data;

      const response = await authService.register(payload);
      const responseData = response.data?.data || response.data;

      // Register API returns { token, customer } (not "user")
      const rawUser = responseData.customer ?? responseData.user;
      const user = rawUser ? customerToUser(rawUser) : null;

      if (responseData.token) {
        setAuthToken(responseData.token);
      }
      if (user) {
        setUserData(user);
      }

      return {
        user,
        token: responseData.token,
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Registration failed'
      );
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (data?: any, { rejectWithValue } = {} as any) => {
    try {
      await authService.logout(data || {});
      clearAuthToken();
      return null;
    } catch (error: any) {
      // Even if API call fails, clear local data
      clearAuthToken();
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getCurrentUser();
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
 * Restores session from localStorage; refreshes via /me (users/me or customers/me for customers)
 */
export const initializeAuth = createAsyncThunk('auth/initialize', async () => {
  try {
    const token = getAuthToken();
    const cachedUser = getUserData<User>();

    if (!token) {
      return null;
    }

    const meResult = await fetchMeApi();
    if (meResult) {
      setUserData(meResult.user);
      return { user: meResult.user, bank: meResult.bank, token };
    }

    if (cachedUser) {
      return { user: cachedUser, token };
    }

    return null;
  } catch (error: any) {
    console.log(error);
    return null;
  }
});

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
      state.bank = null;
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
        state.isLoading = true;
        state.isLoggingIn = true;
        state.error = null;
      })
      .addCase(superAdminLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isLoggingIn = false;
        state.user = action.payload.user;
        state.bank = action.payload.bank ?? null;
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
      .addCase(adminLogin.fulfilled, (state, action: any) => {
        state.isLoading = false;
        state.isLoggingIn = false;
        state.user = action.payload.user;
        state.bank = action.payload.bank ?? null;
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
        state.bank = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
        state.isLoggingIn = false;
      })
      .addCase(logout.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.bank = null;
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

    // Fetch /me (refresh profile + subscriptionStatus + bank)
    builder
      .addCase(fetchMe.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload.user;
          state.bank = action.payload.bank ?? null;
          state.isAuthenticated = true;
        }
      })
      .addCase(fetchMe.rejected, () => {
        // do not clear auth; user stays as-is
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
          state.bank = action.payload.bank ?? null;
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
