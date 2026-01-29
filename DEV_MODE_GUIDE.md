# Development Mode Guide - Working Without Backend

## 🚀 Current Status

Authentication bypass is now **DISABLED**! Real authentication is enabled.

To work on the dashboard, you need:
- ✅ Backend running with auth endpoints
- ✅ Real login credentials
- ✅ Valid API responses

## 🔐 Auth Bypass (Optional for UI Development)

If you want to work on UI without a backend, you can enable bypass mode:

### What Gets Enabled:
- ✅ **Auto-login** as superadmin on app start
- ✅ **No API calls** required for authentication
- ✅ **Full dashboard access** with superadmin permissions
- ✅ **No token expiration** worries
- ✅ **Skip all auth checks** (ProtectedRoute, RoleGuard, MultiRoleGuard)

## 👤 Mock Users Available

### 1. **Superadmin** (Default)
```typescript
{
  id: 'mock-superadmin-001',
  email: 'admin@mis.local',
  name: 'Super Admin',
  role: 'superadmin',
  permissions: ['*'] // All permissions
}
```

### 2. **Customer**
```typescript
{
  id: 'mock-customer-001',
  email: 'customer@mis.local',
  name: 'Test Customer',
  role: 'customer',
  permissions: ['read:own', 'update:own']
}
```

## 🔧 Configuration

### Current Settings

**Auth Bypass:** ❌ **DISABLED** (Real authentication required)

### Enable Bypass (For UI Development)

To enable bypass mode and work without a backend:

**Option 1: Environment Variable** (Recommended)
```bash
# Create .env.development file
VITE_BYPASS_AUTH=true
VITE_MOCK_USER=superadmin  # or 'customer'
```

**Option 2: Modify Code Directly**
```typescript
// src/config/environment.ts
DEV: {
  BYPASS_AUTH: true,  // Change from import.meta.env check
  MOCK_USER: 'superadmin',
}
```

### Switch Between Mock Users (When Bypass is Enabled)

To test customer view instead of superadmin:

```bash
# .env.development
VITE_BYPASS_AUTH=true
VITE_MOCK_USER=customer
```

### Disable Bypass (Current State)

Real backend authentication is now active:

```bash
# .env.development
VITE_BYPASS_AUTH=false  # or omit this line
```

## 📝 What Gets Bypassed

1. **Login API calls** - No need for `/auth/login` endpoint
2. **Token validation** - No need for `/auth/me` endpoint
3. **Token refresh** - No expiration handling needed
4. **Protected routes** - Automatically authenticated
5. **Role guards** - Superadmin has access to everything
6. **API interceptors** - Won't fail on 401 errors

## 🎯 Current State

```
✅ Mode: Development
❌ Auth Bypass: DISABLED
🔐 Authentication: Real Auth Required
🔑 Login Required: Yes
🌐 Backend Required: Yes
```

## 🔄 Backend Integration (Current State)

Auth bypass is now **disabled**. You're ready for backend integration:

1. ✅ `VITE_BYPASS_AUTH=false` (or not set)
2. Configure your API URL: `VITE_API_BASE_URL=http://your-backend-url/api`
3. Configure Google OAuth: `VITE_GOOGLE_CLIENT_ID=your_client_id`
4. Restart dev server: `npm run dev`
5. Use real login credentials

### Required Backend Endpoints:
- `POST /auth/login` - Email/password login
- `POST /auth/google` - Google OAuth login
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Token refresh
- `GET /auth/me` - Get current user
- `POST /auth/logout` - Logout
- `POST /auth/forgot-password` - Password reset
- `POST /auth/verify-otp` - OTP verification

## 📋 Notes

- **Production builds** automatically disable bypass (always uses real auth)
- **Auth bypass is now DISABLED** by default in development
- **Backend is required** for authentication to work
- **Mock data** is only available when bypass is explicitly enabled
- **Socket.io** requires backend connection
- **API calls** need real backend endpoints

## 🎨 UI Development Without Backend

If you want to focus on UI development without a backend:

1. **Enable Bypass Mode:**
   ```bash
   # Create .env.development
   VITE_BYPASS_AUTH=true
   ```

2. **Restart Dev Server:**
   ```bash
   npm run dev
   ```

3. **You can then:**
   - ✨ Design and build dashboard components
   - 🎨 Test superadmin views and permissions
   - 🔧 Create admin-only features
   - 📊 Build charts and analytics views
   - 🎭 Test different layouts and themes

   **Without worrying about:**
   - ❌ Login screens
   - ❌ Token management
   - ❌ API errors
   - ❌ Auth state issues

---

## 🚨 Important Reminders

1. ✅ **Auth bypass is now DISABLED** - Real authentication is active
2. ✅ **Backend connection required** - Set up your API endpoints
3. ✅ **Production-ready** - Auth is properly configured
4. **Mock data** is only for bypass mode (currently disabled)
5. **Never deploy with bypass enabled** (production builds disable it automatically)

---

## 🎯 Quick Reference

### Current Configuration:
```
Auth Bypass:     DISABLED ❌
Authentication:  Real Auth Required 🔐
Backend:         Required 🌐
Login:           /sign-in 🔑
Register:        /register 📝
```

### To Enable Bypass (UI Development):
```bash
# Create .env.development
VITE_BYPASS_AUTH=true
VITE_MOCK_USER=superadmin
```

### To Disable Bypass (Backend Integration):
```bash
# Remove or set in .env.development
VITE_BYPASS_AUTH=false
```

---

Happy coding! 🚀
