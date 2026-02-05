### Super Admin Login API Integration (`/superadmin-login`)

This document explains how the **Super Admin login** is wired to the backend API endpoint `/superadmin-login`.

---

### 1. API Service Layer

**File**: `src/services/api/endpoints/auth.service.ts`

We added a dedicated method on top of the existing auth service:

```ts
/**
 * Super Admin login with dedicated endpoint
 * This uses the `/superadmin-login` API as requested.
 */
async superAdminLogin(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await axiosInstance.post<ApiResponse<AuthResponse>>(
    `/superadmin-login`,
    credentials
  );
  return response.data.data;
}
```

- **Request**: `POST /superadmin-login`
  - Body: `{ email: string; password: string; rememberMe?: boolean }`
- **Response** (`AuthResponse`):
  - `token`: JWT access token
  - `refreshToken` (optional)
  - `user`: logged-in user object (including role, e.g. `SUPER_ADMIN`)

All axios interceptors (logging, auth headers, refresh token handling) are applied automatically through `axiosInstance`.

---

### 2. Redux Auth Slice Thunk

**File**: `src/store/slices/auth.slice.ts`

We created a dedicated thunk that uses the new service method:

```ts
export const superAdminLogin = createAsyncThunk(
  'auth/superAdminLogin',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.superAdminLogin(credentials);

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
```

**State updates in `extraReducers`:**

- `superAdminLogin.pending`
  - `isLoading = true`
  - `error = null`
- `superAdminLogin.fulfilled`
  - `isLoading = false`
  - `user = action.payload.user`
  - `token = action.payload.token`
  - `isAuthenticated = true`
  - `error = null`
- `superAdminLogin.rejected`
  - `isLoading = false`
  - `error = action.payload as string`
  - `isAuthenticated = false`

This keeps the behavior consistent with the normal `login` thunk, but using the `/superadmin-login` endpoint instead.

---

### 3. `useAuth` Hook Integration

**File**: `src/hooks/use-auth.ts`

The hook now exposes a dedicated function for Super Admin login:

```ts
const handleSuperAdminLogin = useCallback(
  async (credentials: LoginCredentials) =>
    dispatch(superAdminLogin(credentials)).unwrap(),
  [dispatch]
);

return {
  // ...
  login: handleLogin,
  loginSuperAdmin: handleSuperAdminLogin,
};
```

- `loginSuperAdmin` calls the `superAdminLogin` thunk and returns a promise.
- `.unwrap()` allows the UI to `try/catch` errors from the thunk.

---

### 4. Super Admin Login Page UI Flow

**File**: `src/sections/auth/sign-in-superadmin-view.tsx`

The Super Admin form uses the new hook function:

```ts
export function SignInSuperAdminView() {
  const router = useRouter();
  const { loginSuperAdmin, isLoading, error } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSignIn = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        await loginSuperAdmin({
          email: formData.email,
          password: formData.password,
          rememberMe: true,
        });
        router.push('/');
      } catch (err) {
        console.error('Login failed:', err);
      }
    },
    [formData, loginSuperAdmin, router]
  );
}
```

**End-to-end flow when user clicks “Sign In as Super Admin”:**

1. Form `onSubmit` calls `handleSignIn`.
2. `handleSignIn` calls `loginSuperAdmin(credentials)`.
3. `loginSuperAdmin` dispatches the `superAdminLogin` thunk.
4. Thunk calls `authService.superAdminLogin` → `POST /superadmin-login`.
5. On success:
   - Tokens and user are stored (localStorage + Redux).
   - Socket service is authenticated and connected.
   - `isAuthenticated = true`, `user` is populated.
   - UI navigates to `/` (dashboard) via `router.push('/')`.
6. On failure:
   - Thunk rejects; error is stored in `state.auth.error`.
   - The error message is shown in the `Alert` on the form.

---

### 5. Key Points / How to Use

- **Endpoint**: backend must expose `POST /superadmin-login` returning the standard `AuthResponse`.
- **UI Entry**: Super Admins use `/sign-in/superadmin` page.
- **Role Handling**: The returned `user` object should have role `SUPER_ADMIN` so your existing `RoleGuard` / `MultiRoleGuard` and navigation behave correctly.

This setup cleanly separates Super Admin authentication while reusing the existing auth infrastructure (tokens, storage, sockets, guards, and hooks).

