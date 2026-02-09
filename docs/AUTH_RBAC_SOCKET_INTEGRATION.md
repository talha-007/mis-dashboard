# Authentication, RBAC & Socket.io Integration Guide

## 📋 Table of Contents

1. [Current Auth & RBAC Analysis](#current-auth--rbac-analysis)
2. [Strengths & Achievements](#strengths--achievements)
3. [Identified Flaws & Weaknesses](#identified-flaws--weaknesses)
4. [Recommendations & Fixes](#recommendations--fixes)
5. [Socket.io Implementation Guide](#socketio-implementation-guide)
6. [Step-by-Step Implementation](#step-by-step-implementation)
7. [Testing & Verification](#testing--verification)

---

## Current Auth & RBAC Analysis

### Your Setup Overview

**Authentication Architecture:**
- Redux-based state management (`src/redux/slice/authSlice.tsx`)
- Three login roles: SUPER_ADMIN, ADMIN, CUSTOMER
- Token-based auth (JWT) stored in localStorage
- Role-based access control (RBAC) with permissions
- Route guards for protected/guest routes

**RBAC Implementation:**
- Permission enum with 15+ granular permissions
- Role-to-permission mapping (`ROLE_PERMISSIONS`)
- Route-to-permission mapping (`ROUTE_PERMISSIONS`)
- Guards: `RoleGuard`, `MultiRoleGuard`, `ProtectedRoute`, `AuthRouteGuard`

**Socket Integration (Partial):**
- Socket service exists but is underutilized
- Connected at login, disconnected at logout
- Event handlers commented out (TODO)
- Real-time features gated behind feature flags

---

## Strengths & Achievements

✅ **Well-structured Redux auth slice**
- Clear action creators for each login type
- Proper localStorage persistence
- Token refresh handling in axios interceptors
- Auth initialization on app startup

✅ **Granular permission system**
- 15+ fine-grained permissions
- Clear role-to-permission mapping
- Supports both role and permission-based checks

✅ **Multiple route protection layers**
- `ProtectedRoute` - checks authentication
- `RoleGuard` - single role enforcement
- `MultiRoleGuard` - multiple role support
- `AuthRouteGuard` - prevents authenticated users from accessing login pages

✅ **Socket service foundation**
- Proper Socket.io client configuration
- Auth token integration
- Reconnection logic with exponential backoff
- Event handler pattern with unsubscribers

✅ **Real-time feature flags**
- Environment-based feature control
- Safe socket initialization
- Graceful fallback when disabled

---

## Identified Flaws & Weaknesses

### 🔴 Critical Issues

#### 1. **No Token Refresh Logic in HTTP Interceptor**
```
ISSUE: Your axios interceptor only adds the token but doesn't handle 401 responses
IMPACT: When token expires, users get stuck with stale auth state
SEVERITY: HIGH - Users will need to manually logout and re-login

Current code (src/redux/services/http-common.tsx):
```
callAPi.interceptors.response.use((response) => response, (error) => Promise.reject(error));
```

**What's missing:**
- 401 error detection
- Token refresh attempt
- Retry failed request with new token
- Prevent multiple simultaneous refresh attempts (mutex)

#### 2. **Socket Connection Not Thread-Safe**
```
ISSUE: Multiple concurrent login thunks can trigger multiple socket.connect() calls
IMPACT: Race conditions, multiple socket instances, duplicate events
SEVERITY: MEDIUM - Intermittent bugs during rapid auth changes
```

**Current issue in authSlice.tsx:**
```typescript
// Lines 62-65, 96-99, 130-133 (repeated 3x in different thunks)
if (data.token) {
  const socket = await getSocketService();
  socket.updateAuth(data.token);
  socket.connect();  // ⚠️ No synchronization mechanism
}
```

#### 3. **Permission System Not Enforced Server-Side**
```
ISSUE: Frontend controls all permission checks - no backend validation
IMPACT: Users can manipulate permissions in DevTools and access restricted features
SEVERITY: CRITICAL - Security vulnerability
```

**What's missing:**
- Backend must validate user permissions for every API call
- Backend should return 403 Forbidden for unauthorized operations
- Frontend should respect these backend rejections

#### 4. **No Audit/Logging for Auth Events**
```
ISSUE: No logging of login/logout/failed attempts
IMPACT: Can't detect suspicious activity, no compliance trail
SEVERITY: MEDIUM - Required for compliance and security audits
```

#### 5. **Socket Events Handler Not Integrated with Redux**
```
ISSUE: Socket events are received but not stored in Redux (all TODO comments)
IMPACT: Notifications and updates don't reach component state
SEVERITY: HIGH - Real-time features are non-functional
```

Lines 54-88 in `src/providers/socket.provider.tsx` - all dispatches are commented out.

#### 6. **No Request Timeout Handling**
```
ISSUE: Axios requests can hang indefinitely
IMPACT: App appears frozen if backend is slow/unresponsive
SEVERITY: MEDIUM - Poor UX
```

#### 7. **Socket Auth Not Updated When Token Refreshes**
```
ISSUE: When HTTP token refreshes, socket still uses old token
IMPACT: Socket authentication fails after HTTP token refresh
SEVERITY: HIGH - Socket disconnects on token refresh
```

---

## Recommendations & Fixes

### Fix 1: Implement Token Refresh with Mutex Lock

**File:** `src/redux/services/http-common.tsx`

```typescript
let tokenRefreshPromise: Promise<string | null> | null = null;

const responseInterceptor = async (error: any) => {
  const originalRequest = error.config;

  // Check if this is a 401 Unauthorized error
  if (error.response?.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;

    try {
      // Use mutex to prevent multiple simultaneous refresh attempts
      if (!tokenRefreshPromise) {
        tokenRefreshPromise = (async () => {
          try {
            const response = await axios.post(
              `${API_URL}/api/auth/refresh`,
              {},
              { withCredentials: true }
            );
            const newToken = response.data?.data?.token || response.data?.token;
            
            // Update token in localStorage and Redux
            if (newToken) {
              setAuthToken(newToken);
              // Dispatch Redux action to update token in store
              return newToken;
            }
            return null;
          } finally {
            tokenRefreshPromise = null;
          }
        })();
      }

      const newToken = await tokenRefreshPromise;

      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return callAPi(originalRequest);
      } else {
        // Token refresh failed - clear auth and redirect to login
        clearAuthToken();
        window.location.href = '/sign-in';
      }
    } catch (refreshError) {
      clearAuthToken();
      window.location.href = '/sign-in';
      return Promise.reject(refreshError);
    }
  }

  return Promise.reject(error);
};

callAPi.interceptors.response.use((response) => response, responseInterceptor);
```

### Fix 2: Add Request Timeout

**File:** `src/redux/services/http-common.tsx`

```typescript
export const callAPi = axios.create({
  withCredentials: true,
  baseURL: API_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-type': 'application/json',
  },
});
```

### Fix 3: Socket Connection Singleton with Mutex

**File:** `src/redux/slice/authSlice.tsx`

```typescript
let socketConnectPromise: Promise<void> | null = null;

const ensureSocketConnected = async (token: string) => {
  if (!socketConnectPromise) {
    socketConnectPromise = (async () => {
      try {
        const socket = await getSocketService();
        socket.updateAuth(token);
        socket.connect();
      } finally {
        socketConnectPromise = null;
      }
    })();
  }
  return socketConnectPromise;
};

// Then in each login thunk, replace the socket connection code with:
if (data.token) {
  await ensureSocketConnected(data.token);
}
```

### Fix 4: Integrate Socket Events with Redux

**File:** `src/redux/slice/notificationSlice.tsx` (CREATE NEW)

```typescript
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { NotificationPayload } from 'src/services/socket';

interface Notification extends NotificationPayload {
  id: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadCount++;
      }
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount--;
      }
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
  },
});

export const { addNotification, markAsRead, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
```

### Fix 5: Update Socket Provider to Dispatch Redux Actions

**File:** `src/providers/socket.provider.tsx`

```typescript
import { useAppDispatch, useAppSelector } from 'src/store';
import { addNotification } from 'src/redux/slice/notificationSlice'; // New slice

export function SocketProvider({ children }: SocketProviderProps) {
  const dispatch = useAppDispatch();
  const { isAuthenticated, token, isInitialized } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isInitialized || !isAuthenticated || !token || !ENV.FEATURES.REAL_TIME) {
      return undefined;
    }

    socketService.updateAuth(token);
    socketService.connect();

    const unsubscribers: Array<() => void> = [];

    // UNCOMMENT AND ACTIVATE:
    if (ENV.FEATURES.NOTIFICATIONS) {
      unsubscribers.push(
        socketService.on<NotificationPayload>(SocketEvent.NOTIFICATION, (notification) => {
          console.log('[Socket] Notification received:', notification);
          // NOW DISPATCH TO REDUX
          dispatch(addNotification({
            ...notification,
            createdAt: notification.createdAt || new Date().toISOString(),
          }));
        })
      );
    }

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [dispatch, isAuthenticated, isInitialized, token]);

  // ... rest of component
}
```

### Fix 6: Update Token Refresh to Update Socket

**File:** `src/redux/slice/authSlice.tsx`

```typescript
// Add a new reducer to handle token updates
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // ... existing reducers
    updateToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      setAuthToken(action.payload);
      
      // Also update socket auth
      getSocketService().then(socket => {
        socket.updateAuth(action.payload);
      });
    },
  },
});
```

Then in `http-common.tsx`:

```typescript
import { store } from 'src/store';
import { updateToken } from 'src/redux/slice/authSlice';

const newToken = response.data?.data?.token;
if (newToken) {
  store.dispatch(updateToken(newToken));
  return callAPi(originalRequest);
}
```

---

## Socket.io Implementation Guide

### What is Socket.io?

Socket.io provides **real-time, bidirectional communication** between client and server using WebSocket (with fallback to polling).

**Use cases in your MIS Dashboard:**
- 📢 Bank payment notifications
- 📊 Dashboard metrics updates in real-time
- ⚠️ System alerts (loan approvals, payment due dates)
- 🔔 Admin notifications (suspicious activities, failed transactions)
- 📈 Analytics streaming

### Backend Requirements

Your backend **MUST** implement:

#### 1. **Socket.io Setup**
```javascript
// Node.js example
const io = require('socket.io')(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
});

// Namespace for authenticated users
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }
  
  try {
    const user = verifyToken(token); // Your JWT verification
    socket.userId = user.id;
    socket.userRole = user.role;
    next();
  } catch (error) {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  console.log(`User ${socket.userId} connected`);

  // Join room based on user role for targeted broadcasts
  socket.join(`role:${socket.userRole}`);
  socket.join(`user:${socket.userId}`);

  socket.on('disconnect', () => {
    console.log(`User ${socket.userId} disconnected`);
  });
});
```

#### 2. **Emit Events to Clients**
```javascript
// Send notification to specific user
io.to(`user:${bankAdminId}`).emit('notification', {
  id: `notif-${Date.now()}`,
  title: 'Payment Recorded',
  message: 'Your monthly subscription has been activated',
  type: 'success',
  createdAt: new Date().toISOString(),
});

// Broadcast to all super admins
io.to('role:superadmin').emit('system_alert', {
  title: 'High-Value Transaction',
  message: 'Transaction exceeding threshold detected',
  type: 'warning',
});

// Real-time dashboard updates
io.to(`user:${superAdminId}`).emit('stats_update', {
  metric: 'total_revenue',
  value: 1250000,
  timestamp: new Date().toISOString(),
});
```

#### 3. **Event Types Supported**
```javascript
// From SocketEvent enum (src/services/socket/index.ts)
const events = {
  NOTIFICATION: 'notification',          // User notification
  STATS_UPDATE: 'stats_update',         // Dashboard metrics
  ANALYTICS_UPDATE: 'analytics_update', // Analytics data
  SYSTEM_MESSAGE: 'system_message',     // General message
  SYSTEM_ALERT: 'system_alert',         // Critical alert
};
```

---

## Step-by-Step Implementation

### Phase 1: Fix Current Issues (CRITICAL)

#### Step 1.1: Fix HTTP Response Interceptor (HIGHEST PRIORITY)

**File:** `src/redux/services/http-common.tsx`

```typescript
import { store } from 'src/store';
import { updateToken, clearAuth } from 'src/redux/slice/authSlice';

let tokenRefreshPromise: Promise<string | null> | null = null;

const responseInterceptor = async (error: any) => {
  const originalRequest = error.config;

  // Handle 401 Unauthorized
  if (error.response?.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;

    try {
      if (!tokenRefreshPromise) {
        tokenRefreshPromise = (async () => {
          try {
            // Call refresh endpoint
            const response = await axios.post(
              `${API_URL}/api/auth/refresh`,
              {},
              { withCredentials: true, timeout: 5000 }
            );

            const newToken = response.data?.data?.token || response.data?.token;
            
            if (newToken) {
              // Update Redux and localStorage
              store.dispatch(updateToken(newToken));
              return newToken;
            }

            return null;
          } catch (err) {
            console.error('[Auth] Token refresh failed:', err);
            return null;
          } finally {
            tokenRefreshPromise = null;
          }
        })();
      }

      const newToken = await tokenRefreshPromise;

      if (newToken) {
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return callAPi(originalRequest);
      } else {
        // Refresh failed, clear auth
        store.dispatch(clearAuth());
        window.location.href = '/sign-in';
        return Promise.reject(error);
      }
    } catch (err) {
      store.dispatch(clearAuth());
      window.location.href = '/sign-in';
      return Promise.reject(err);
    }
  }

  // Handle 403 Forbidden (permission denied)
  if (error.response?.status === 403) {
    console.warn('[Auth] Access denied - insufficient permissions');
    // Navigate to unauthorized page
    window.location.href = '/unauthorized';
  }

  return Promise.reject(error);
};

callAPi.interceptors.response.use((response) => response, responseInterceptor);
callAPiMultiPart.interceptors.response.use((response) => response, responseInterceptor);
```

**Changes needed in authSlice.tsx:**

Update the `updateToken` reducer to also update socket:

```typescript
updateToken: (state, action: PayloadAction<string>) => {
  state.token = action.payload;
  setAuthToken(action.payload);
  
  // Update socket connection auth
  getSocketService().then(socket => {
    socket.updateAuth(action.payload);
  }).catch(err => console.error('Failed to update socket auth:', err));
},
```

#### Step 1.2: Add Request Timeout

**File:** `src/redux/services/http-common.tsx`

```typescript
export const callAPi = axios.create({
  withCredentials: true,
  baseURL: API_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-type': 'application/json',
  },
});

export const callAPiMultiPart = axios.create({
  baseURL: API_URL,
  timeout: 60000, // 60 seconds for file uploads
  headers: {
    'Content-type': 'multipart/form-data',
  },
});
```

#### Step 1.3: Fix Socket Connection Race Condition

**File:** `src/redux/slice/authSlice.tsx`

```typescript
// Add at top level
let socketConnectPromise: Promise<void> | null = null;

const ensureSocketConnected = async (token: string | null) => {
  if (!token) return;

  if (!socketConnectPromise) {
    socketConnectPromise = (async () => {
      try {
        const socket = await getSocketService();
        socket.updateAuth(token);
        socket.connect();
      } catch (err) {
        console.error('[Socket] Connection failed:', err);
      } finally {
        socketConnectPromise = null;
      }
    })();
  }

  return socketConnectPromise;
};

// Then update each login thunk (superAdminLogin, adminLogin, userLogin, googleLogin)
// Replace the socket connection code with:
if (data.token) {
  try {
    await ensureSocketConnected(data.token);
  } catch (err) {
    console.error('[Auth] Socket connection error:', err);
    // Don't fail login if socket fails - just log it
  }
}
```

Do the same in `initializeAuth` thunk.

### Phase 2: Implement Notification Redux Slice (IMPORTANT)

#### Step 2.1: Create Notification Slice

**File:** `src/redux/slice/notificationSlice.tsx` (NEW)

```typescript
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  data?: any;
}

interface NotificationState {
  items: Notification[];
  unreadCount: number;
}

const initialState: NotificationState = {
  items: [],
  unreadCount: 0,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.items.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.items.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount -= 1;
      }
    },
    markAllAsRead: (state) => {
      state.items.forEach(n => { n.read = true; });
      state.unreadCount = 0;
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      const idx = state.items.findIndex(n => n.id === action.payload);
      if (idx >= 0) {
        if (!state.items[idx].read) {
          state.unreadCount -= 1;
        }
        state.items.splice(idx, 1);
      }
    },
    clearNotifications: (state) => {
      state.items = [];
      state.unreadCount = 0;
    },
  },
});

export const { 
  addNotification, 
  markAsRead, 
  markAllAsRead,
  removeNotification, 
  clearNotifications 
} = notificationSlice.actions;

export default notificationSlice.reducer;
```

#### Step 2.2: Register in Redux Store

**File:** `src/store/index.ts`

```typescript
import notificationReducer from 'src/redux/slice/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    notifications: notificationReducer, // ADD THIS
    // ... other reducers
  },
});
```

#### Step 2.3: Update Socket Provider to Dispatch

**File:** `src/providers/socket.provider.tsx`

```typescript
import { useAppDispatch, useAppSelector } from 'src/store';
import { addNotification } from 'src/redux/slice/notificationSlice';

export function SocketProvider({ children }: SocketProviderProps) {
  const dispatch = useAppDispatch();
  const { isAuthenticated, token, isInitialized } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isInitialized || !isAuthenticated || !token || !ENV.FEATURES.REAL_TIME) {
      return undefined;
    }

    socketService.updateAuth(token);
    socketService.connect();

    const unsubscribers: Array<() => void> = [];

    // ACTIVATE NOTIFICATION HANDLER
    if (ENV.FEATURES.NOTIFICATIONS) {
      unsubscribers.push(
        socketService.on<NotificationPayload>(SocketEvent.NOTIFICATION, (notification) => {
          console.log('[Socket] Notification received:', notification);
          dispatch(addNotification({
            id: notification.id,
            title: notification.title,
            message: notification.message,
            type: notification.type,
            read: notification.read,
            createdAt: notification.createdAt || new Date().toISOString(),
            data: notification.data,
          }));
        })
      );
    }

    // ACTIVATE SYSTEM ALERT HANDLER
    unsubscribers.push(
      socketService.on<any>(SocketEvent.SYSTEM_ALERT, (alert) => {
        console.log('[Socket] System alert:', alert);
        dispatch(addNotification({
          id: `alert-${Date.now()}`,
          title: alert.title || 'System Alert',
          message: alert.message || 'An alert has been received',
          type: alert.type || 'warning',
          read: false,
          createdAt: new Date().toISOString(),
          data: alert,
        }));
      })
    );

    if (ENV.FEATURES.ANALYTICS) {
      unsubscribers.push(
        socketService.on<StatsUpdatePayload>(SocketEvent.STATS_UPDATE, (stats) => {
          console.log('[Socket] Stats update:', stats);
          // Dispatch stats update to Redux (create stats slice if needed)
          // dispatch(updateMetric(stats));
        })
      );
    }

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
      socketService.disconnect();
    };
  }, [dispatch, isAuthenticated, isInitialized, token]);

  const contextValue: SocketContextValue = useMemo(
    () => ({
      isConnected: socketService.isConnected(),
      emit: socketService.emit.bind(socketService),
      on: socketService.on.bind(socketService),
      off: socketService.off.bind(socketService),
    }),
    [isAuthenticated, token]
  );

  return <SocketContext.Provider value={contextValue}>{children}</SocketContext.Provider>;
}
```

### Phase 3: Create Notification UI Component

#### Step 3.1: Create Notification Center Component

**File:** `src/sections/overview/notification-center.tsx` (NEW)

```typescript
import { useState } from 'react';
import {
  Badge,
  IconButton,
  Popover,
  Stack,
  List,
  ListItem,
  ListItemText,
  Button,
  Box,
  Typography,
  Chip,
  Divider,
} from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { useAppDispatch, useAppSelector } from 'src/store';
import { markAsRead, markAllAsRead, removeNotification } from 'src/redux/slice/notificationSlice';

export function NotificationCenter() {
  const dispatch = useAppDispatch();
  const { items, unreadCount } = useAppSelector((state) => state.notifications);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = (id: string) => {
    dispatch(markAsRead(id));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  const handleRemove = (id: string) => {
    dispatch(removeNotification(id));
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton onClick={handleOpen} color="inherit">
        <Badge badgeContent={unreadCount} color="error">
          <Iconify icon="solar:bell-bing-bold" />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: { width: 360, maxHeight: 480 },
        }}
      >
        <Stack spacing={0} sx={{ height: '100%' }}>
          {/* Header */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ p: 2, borderBottom: '1px solid #f0f0f0' }}
          >
            <Typography variant="h6">Notifications</Typography>
            {unreadCount > 0 && (
              <Button size="small" onClick={handleMarkAllAsRead}>
                Mark all as read
              </Button>
            )}
          </Stack>

          {/* List */}
          {items.length > 0 ? (
            <List
              sx={{
                flex: 1,
                overflow: 'auto',
                '& .MuiListItem-root': {
                  '&:hover': { bgcolor: '#f9f9f9' },
                },
              }}
            >
              {items.map((notification, index) => (
                <Box key={notification.id}>
                  <ListItem
                    secondaryAction={
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => handleRemove(notification.id)}
                      >
                        <Iconify icon="solar:close-circle-bold" />
                      </IconButton>
                    }
                    sx={{
                      bgcolor: notification.read ? 'transparent' : 'rgba(0, 167, 111, 0.05)',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: notification.read ? '#f9f9f9' : 'rgba(0, 167, 111, 0.1)' },
                    }}
                    onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Typography variant="subtitle2">{notification.title}</Typography>
                          <Chip
                            label={notification.type}
                            size="small"
                            color={
                              notification.type === 'success'
                                ? 'success'
                                : notification.type === 'error'
                                  ? 'error'
                                  : notification.type === 'warning'
                                    ? 'warning'
                                    : 'default'
                            }
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={notification.message}
                    />
                  </ListItem>
                  {index < items.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          ) : (
            <Stack sx={{ p: 3, textAlign: 'center' }} spacing={1}>
              <Iconify icon="solar:inbox-bold" sx={{ mx: 'auto', width: 48, height: 48 }} />
              <Typography variant="body2" color="text.secondary">
                No notifications
              </Typography>
            </Stack>
          )}
        </Stack>
      </Popover>
    </>
  );
}
```

#### Step 3.2: Add to Dashboard Header

**File:** `src/layouts/dashboard/header.tsx`

```typescript
// Add NotificationCenter to header imports and render
import { NotificationCenter } from 'src/sections/overview/notification-center';

// In render, add to toolbar:
<Toolbar>
  {/* ... existing toolbar items */}
  <NotificationCenter />
  {/* ... more toolbar items */}
</Toolbar>
```

### Phase 4: Test Everything

---

## Testing & Verification

### Test Checklist

#### ✅ Authentication Tests

- [ ] Login with Super Admin account
- [ ] Verify token is stored in localStorage
- [ ] Verify user state in Redux
- [ ] Close and reopen browser - user should be logged in
- [ ] Let token expire (if backend supports)
- [ ] Verify automatic token refresh occurs
- [ ] Verify request retries with new token
- [ ] Manual logout clears token and Redis auth

#### ✅ RBAC Tests

- [ ] Super Admin can access all routes
- [ ] Admin cannot access `/bank-management` (redirects to /unauthorized)
- [ ] Customer cannot access admin-only routes
- [ ] Manually set permissions in DevTools and verify frontend respects backend 403 responses
- [ ] API rejects requests with 403 Forbidden when user lacks permission
- [ ] Frontend gracefully handles 403 errors

#### ✅ Socket Tests

- [ ] Socket connects on login
- [ ] Socket disconnects on logout
- [ ] Socket reconnects after page refresh
- [ ] Multiple tabs: socket handles correctly without conflicts
- [ ] Receive notifications from backend
- [ ] Notifications appear in notification center
- [ ] Can mark notifications as read
- [ ] Unread count updates correctly
- [ ] System alerts trigger notifications

#### ✅ Integration Tests

- [ ] Login → Socket connects → Notification arrives → Shows in UI ✨
- [ ] Token refresh → Socket auth updates → Continues receiving notifications
- [ ] Multiple rapid logins/logouts → No race conditions or errors
- [ ] Network disconnection → Socket auto-reconnects
- [ ] Token in DevTools → Modify it → 401 response → Auto-refresh

### Manual Testing Commands

```bash
# Test 1: Open browser DevTools
# Open: http://localhost:3039/sign-in/superadmin
# Login
# Check: localStorage has 'auth_token'
# Check: Redux DevTools shows user in state
# Open Console and watch for socket connection logs

# Test 2: Token refresh
# In DevTools Console:
window.localStorage.removeItem('auth_token');
# Trigger an API call (navigate, refresh page)
# Should auto-redirect to login

# Test 3: Socket notifications
# Backend sends: io.to('user:USER_ID').emit('notification', {...})
# Frontend should receive in console: "[Socket] Notification received"
# Should appear in notification center UI

# Test 4: Permission denial
# In DevTools Console:
window.localStorage.setItem('auth_token', 'INVALID');
# Try making API call
# Should get 401 and redirect to login
```

---

## Summary: What You Need to Do

### Priority 1: CRITICAL (Do First)
1. ✅ Implement token refresh in HTTP interceptor
2. ✅ Add request timeout
3. ✅ Fix socket connection race condition
4. ✅ Update axios error handling for 403 Forbidden

### Priority 2: IMPORTANT (Do Next)
5. ✅ Create notification Redux slice
6. ✅ Update socket provider to dispatch Redux actions
7. ✅ Create notification center UI component
8. ✅ Add notification center to dashboard header

### Priority 3: NICE TO HAVE
9. Update backend to emit real-time notifications
10. Add more socket event types (payment updates, dashboard metrics)
11. Implement notification preferences per user
12. Add persistence for notification history

### Backend Integration Points

Your backend MUST provide:

```
✅ POST /api/auth/refresh
   - Input: (no body needed, uses refresh token from httpOnly cookie or body)
   - Output: { data: { token: "new_jwt_token" } }

✅ Socket.io connection with auth
   - Verify JWT token from socket handshake
   - Add user to role-based rooms (role:SUPER_ADMIN, user:USER_ID)

✅ Emit events on actions:
   - 'notification' when bank payment recorded, loan approved, etc.
   - 'system_alert' for critical events
   - 'stats_update' for dashboard metrics
```

---

## Environment Variables Needed

**File:** `.env.development`

```env
# Socket Configuration
VITE_SOCKET_URL=http://localhost:3001
VITE_SOCKET_PATH=/socket.io
VITE_FEATURES_REAL_TIME=true
VITE_FEATURES_NOTIFICATIONS=true
VITE_FEATURES_ANALYTICS=false

# Timeouts
VITE_API_TIMEOUT=30000
VITE_SOCKET_RECONNECTION_DELAY=1000
VITE_SOCKET_RECONNECTION_ATTEMPTS=5
```

---

## Conclusion

Your current auth and RBAC setup is **solid but incomplete**. The main gaps are:

1. **No token refresh** → Users get stuck after token expiry
2. **Socket events not stored** → Real-time features don't work
3. **No backend permission validation** → Security risk
4. **Race conditions on socket** → Bugs under concurrent auth changes

With the fixes outlined above, your system will be **production-ready** with proper security, real-time features, and excellent user experience.

**Next Step:** Start with Priority 1 fixes. They take ~2 hours and fix critical security/functionality issues.
