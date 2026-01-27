# Environment Variables Setup Guide

## Quick Setup

### Step 1: Create Your Local Environment File

Copy the example file and rename it:

```bash
# For development
cp .env.development.example .env.development

# OR manually create the file
# File: .env.development
```

### Step 2: Fill In Your Values

Open `.env.development` and update these values:

```env
# ============================================
# REQUIRED: Update These Values
# ============================================

# Your backend API URL (update port if different)
VITE_API_BASE_URL=http://localhost:5000/api

# Your WebSocket URL (usually same as API base without /api)
VITE_SOCKET_URL=http://localhost:5000

# Your Google OAuth Client ID (see instructions below)
VITE_GOOGLE_CLIENT_ID=your-actual-client-id-here.apps.googleusercontent.com

# ============================================
# OPTIONAL: Keep Default Values or Customize
# ============================================

VITE_API_TIMEOUT=30000
VITE_SOCKET_PATH=/socket.io
VITE_SOCKET_RECONNECTION_ATTEMPTS=5
VITE_SOCKET_RECONNECTION_DELAY=3000
VITE_APP_NAME=MIS Dashboard
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=development
VITE_ENABLE_REAL_TIME=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_ANALYTICS=true
```

## Getting Google OAuth Client ID

### Step-by-Step Instructions:

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create a New Project** (or select existing)
   - Click "Select a project" → "New Project"
   - Name it: "MIS Dashboard" (or your preferred name)
   - Click "Create"

3. **Enable Google+ API**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. **Configure OAuth Consent Screen**
   - Go to "APIs & Services" → "OAuth consent screen"
   - Choose "External" (for testing) or "Internal" (for organization)
   - Fill in:
     - App name: "MIS Dashboard"
     - User support email: your email
     - Developer contact: your email
   - Click "Save and Continue"
   - Skip "Scopes" section (or add email, profile)
   - Add test users if using "External"
   - Click "Save and Continue"

5. **Create OAuth 2.0 Client ID**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Choose "Web application"
   - Name: "MIS Dashboard Web Client"
   - Add Authorized JavaScript origins:
     ```
     http://localhost:3039
     http://localhost:5173
     ```
   - Add Authorized redirect URIs:
     ```
     http://localhost:3039
     http://localhost:5173
     ```
   - Click "Create"

6. **Copy Your Client ID**
   - A popup will show your Client ID
   - Copy the Client ID (looks like: `123456789-abc123.apps.googleusercontent.com`)
   - Paste it into your `.env.development` file

7. **For Production** (when deploying):
   - Add your production domain to authorized origins:
     ```
     https://yourdomain.com
     ```
   - Create a separate Client ID for production (recommended)

## Environment File Locations

```
project-root/
├── .env.development          # Your local development config (CREATE THIS)
├── .env.production           # Production config (create when deploying)
├── .env.development.example  # Template (for reference)
└── .env.production.example   # Template (for reference)
```

## Important Notes

### ⚠️ Security

- ✅ `.env.development` and `.env.production` are already in `.gitignore`
- ❌ **NEVER** commit these files to Git
- ❌ **NEVER** share your actual `.env` files publicly
- ✅ Only commit `.example` files (with fake values)

### 📝 Variable Naming

- All variables MUST start with `VITE_` to be accessible in the app
- Vite only exposes variables that start with `VITE_`
- Other variables will not be available in your frontend code

### 🔄 Changing Variables

After changing environment variables:

```bash
# Stop the dev server (Ctrl+C)
# Restart the dev server
npm run dev
```

Variables are loaded at build time, so you need to restart the server.

## Testing Your Configuration

### Test API Connection

Once your backend is running, test if the API URL is correct:

```javascript
// In browser console or a test file
console.log('API URL:', import.meta.env.VITE_API_BASE_URL);
// Should output: http://localhost:5000/api
```

### Test Socket Connection

```javascript
// In browser console
console.log('Socket URL:', import.meta.env.VITE_SOCKET_URL);
// Should output: http://localhost:5000
```

### Test Google OAuth

```javascript
// In browser console
console.log('Google Client ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID);
// Should output: your-client-id.apps.googleusercontent.com
```

## Common Issues

### Issue 1: Variables Not Loading

**Problem:** `import.meta.env.VITE_API_BASE_URL` is undefined

**Solution:**
1. Make sure variable name starts with `VITE_`
2. Restart the dev server
3. Check file is named exactly `.env.development` (not `.env.dev`)

### Issue 2: Google Login Not Working

**Problem:** Google button doesn't appear or shows error

**Solutions:**
1. Verify `VITE_GOOGLE_CLIENT_ID` is set in `.env.development`
2. Check Client ID is correct (no extra spaces)
3. Verify redirect URIs match in Google Console
4. Make sure Google+ API is enabled
5. Check browser console for errors

### Issue 3: API Calls Failing

**Problem:** All API calls return errors

**Solutions:**
1. Verify backend is running on the correct port
2. Check `VITE_API_BASE_URL` matches your backend
3. Verify CORS is configured on backend
4. Check browser console for CORS errors

### Issue 4: Socket Not Connecting

**Problem:** Real-time features not working

**Solutions:**
1. Verify `VITE_SOCKET_URL` is correct
2. Check backend WebSocket server is running
3. Verify port matches backend Socket.io server
4. Check browser console for connection errors

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:5000/api` |
| `VITE_SOCKET_URL` | WebSocket server URL | `http://localhost:5000` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID | `123...apps.googleusercontent.com` |

### Optional Variables (with defaults)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_TIMEOUT` | `30000` | API timeout (ms) |
| `VITE_SOCKET_PATH` | `/socket.io` | Socket.io path |
| `VITE_SOCKET_RECONNECTION_ATTEMPTS` | `5` | Max reconnect attempts |
| `VITE_SOCKET_RECONNECTION_DELAY` | `3000` | Reconnect delay (ms) |
| `VITE_APP_NAME` | `MIS Dashboard` | App name |
| `VITE_APP_VERSION` | `1.0.0` | App version |
| `VITE_ENABLE_REAL_TIME` | `true` | Enable WebSocket |
| `VITE_ENABLE_NOTIFICATIONS` | `true` | Enable notifications |
| `VITE_ENABLE_ANALYTICS` | `true` | Enable analytics |

## Production Deployment

### For Production:

1. Create `.env.production`:
   ```env
   VITE_API_BASE_URL=https://api.yourdomain.com/api
   VITE_SOCKET_URL=https://api.yourdomain.com
   VITE_GOOGLE_CLIENT_ID=production-client-id.apps.googleusercontent.com
   VITE_APP_ENV=production
   ```

2. Add production domain to Google Console

3. Use environment variables in your hosting platform:
   - **Vercel**: Add in Project Settings → Environment Variables
   - **Netlify**: Add in Site Settings → Environment Variables
   - **AWS/Azure**: Configure in deployment settings

4. Build for production:
   ```bash
   npm run build
   ```

## Need Help?

Check these files for more information:
- `docs/SETUP.md` - General setup guide
- `docs/AUTH_SETUP.md` - Authentication setup
- `docs/SETUP_SUMMARY.md` - Complete setup summary

## Quick Copy-Paste Template

Copy this to your `.env.development` file:

```env
# Backend API URL
VITE_API_BASE_URL=http://localhost:5000/api

# WebSocket URL
VITE_SOCKET_URL=http://localhost:5000

# Google OAuth Client ID (get from console.cloud.google.com)
VITE_GOOGLE_CLIENT_ID=

# Optional configurations (keep defaults or customize)
VITE_API_TIMEOUT=30000
VITE_SOCKET_PATH=/socket.io
VITE_SOCKET_RECONNECTION_ATTEMPTS=5
VITE_SOCKET_RECONNECTION_DELAY=3000
VITE_APP_NAME=MIS Dashboard
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=development
VITE_ENABLE_REAL_TIME=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_ANALYTICS=true
```

Just fill in the `VITE_GOOGLE_CLIENT_ID` and you're ready to go! 🚀
