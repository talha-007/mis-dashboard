# Socket.io Notifications Setup Guide

## ✨ Simple & Seamless

Your Socket.io integration is now **simple, clean, and production-ready**. It handles:

- ✅ **Auto-connect on login** - No manual setup needed
- ✅ **Auto-disconnect on logout** - Clean cleanup
- ✅ **Simple error handling** - 401 errors logout user automatically
- ✅ **Idempotent connection** - Safe to call multiple times
- ✅ **Automatic reconnection** - Built-in retry logic
- ✅ **Type-safe events** - Full TypeScript support

---

## 🔧 How It Works

### Frontend Flow

```
User Logs In
    ↓
Auth Token Stored → Redux State Updated
    ↓
Socket Provider Detects Auth Change
    ↓
Socket Connects with Token
    ↓
Listen for 'notification', 'system_alert', 'stats_update' events
    ↓
User Logged Out
    ↓
Socket Disconnects
```

### Backend Requirements

Your backend **MUST** implement Socket.io with:

#### 1. **Server Setup (Node.js Express Example)**

```javascript
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3039',
    credentials: true,
  },
});

// Authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('Authentication error'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    socket.userRole = decoded.role;
    socket.userEmail = decoded.email;
    next();
  } catch (error) {
    next(new Error('Invalid token'));
  }
});

// Connection handler
io.on('connection', (socket) => {
  console.log(`✅ User connected: ${socket.userId}`);

  // Join rooms for targeted broadcasting
  socket.join(`user:${socket.userId}`);
  socket.join(`role:${socket.userRole}`);

  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.userId}`);
  });
});

server.listen(3001, () => {
  console.log('Socket.io server running on port 3001');
});
```

#### 2. **Emit Notifications from Your API**

```javascript
// When a bank payment is recorded
const payment = await recordPayment(bankId, amount);

// Send notification to bank admin
io.to(`user:${bankAdminId}`).emit('notification', {
  id: `payment-${payment._id}`,
  title: 'Payment Recorded ✅',
  message: `Monthly subscription has been activated for ${bankName}`,
  type: 'success',
  read: false,
  createdAt: new Date().toISOString(),
  data: { paymentId: payment._id, bankId },
});

// Send to all Super Admins
io.to('role:superadmin').emit('system_alert', {
  title: 'Payment Alert',
  message: `New payment of $${amount} recorded`,
  type: 'info',
});

// Real-time dashboard update
io.to(`user:${superAdminId}`).emit('stats_update', {
  metric: 'total_revenue',
  value: 1250000,
  timestamp: new Date().toISOString(),
});
```

#### 3. **Events Supported**

| Event | When to Send | Data |
|-------|-------------|------|
| `notification` | User action result (payment, approval, etc) | `{ id, title, message, type, read, data }` |
| `system_alert` | Important system event | `{ title, message, type }` |
| `stats_update` | Dashboard metric changes | `{ metric, value, timestamp }` |
| `analytics_update` | Analytics data | Any custom data |

---

## 🚀 Environment Setup

Add these to `.env.development`:

```env
# Socket Configuration
VITE_SOCKET_URL=http://localhost:3001
VITE_SOCKET_PATH=/socket.io
VITE_ENABLE_REAL_TIME=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_ANALYTICS=false

# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api
VITE_API_TIMEOUT=30000
```

---

## 📝 Frontend Integration

### Step 1: Make Sure Socket Provider is Wrapped

**File:** `src/app.tsx`

```tsx
import { SocketProvider } from 'src/providers/socket.provider';

export function App() {
  return (
    <SocketProvider>
      {/* Your app routes */}
    </SocketProvider>
  );
}
```

### Step 2: Use Socket in Components (Optional)

```tsx
import { useSocket } from 'src/providers/socket.provider';

export function MyComponent() {
  const { isConnected, emit, on } = useSocket();

  return (
    <div>
      Status: {isConnected ? '🟢 Connected' : '⚫ Disconnected'}
      
      {/* Emit custom event */}
      <button onClick={() => emit('custom_event', { data: 'test' })}>
        Send Event
      </button>
    </div>
  );
}
```

### Step 3: Listen for Notifications (Console)

Open your browser DevTools Console and login. You should see:

```
[Socket] 🔄 Initiating connection...
[Socket] ✅ Connected successfully
[Socket] 📬 Notification: Payment Recorded ✅
[Socket] ⚠️ System Alert: High transaction detected
[Socket] 📊 Stats Update: total_revenue = 1250000
```

---

## 🔒 Authentication Flow

### What Happens Behind the Scenes

1. **User Login** 
   - Redux stores JWT token
   - Socket Provider detects auth change

2. **Socket Connection**
   - Sends JWT token in socket handshake (`socket.handshake.auth.token`)
   - Backend verifies JWT and extracts user info
   - Socket joins rooms: `user:{userId}` and `role:{role}`

3. **Receiving Notifications**
   - Backend emits: `io.to('user:123').emit('notification', {...})`
   - Frontend receives in console
   - (Ready for Redux integration when needed)

4. **User Logout**
   - Redux clears auth state
   - Socket Provider detects change
   - Socket auto-disconnects

### What Happens on 401 Error (Token Expired)

```
API Request
    ↓
Backend returns 401 Unauthorized
    ↓
HTTP Interceptor Catches 401
    ↓
Clears localStorage token
    ↓
Dispatches Redux logout
    ↓
Socket auto-disconnects
    ↓
Redirect to /sign-in
```

---

## ✅ Testing Checklist

### Step 1: Start Both Servers

```bash
# Frontend (separate terminal)
npm run dev

# Backend (your backend terminal)
npm run dev  # or appropriate command
```

### Step 2: Browser Console Test

```bash
# In browser DevTools → Console tab
# Login with any account

# You should see:
[Socket] 🔄 Initiating connection...
[Socket] ✅ Connected successfully

# Close DevTools Network tab to avoid spam
```

### Step 3: Test Notifications from Backend

In your backend, after user logs in, emit a test notification:

```javascript
// Get the connected socket
const userSockets = io.sockets.sockets; // All sockets
const testSocket = Array.from(userSockets.values())[0]; // First user

if (testSocket) {
  testSocket.emit('notification', {
    id: 'test-' + Date.now(),
    title: 'Test Notification',
    message: 'If you see this, everything works! 🎉',
    type: 'success',
    read: false,
    createdAt: new Date().toISOString(),
  });
}
```

Check browser console - you should see:

```
[Socket] 📬 Notification: Test Notification
```

### Step 4: Test Connection Loss

1. Open DevTools → Network tab
2. Select "Offline" from throttling
3. Watch socket auto-reconnect in console:
   ```
   [Socket] ❌ Disconnected: transport close
   [Socket] 🔄 Initiating connection...
   [Socket] ✅ Connected successfully
   ```
4. Go back "Online"
5. Socket reconnects

### Step 5: Test Logout

1. Click logout
2. Watch console:
   ```
   [Socket] 🔌 Disconnecting...
   [Socket] ❌ Disconnected: client namespace disconnect
   ```
3. Redirects to `/sign-in`

---

## 🎯 Real-World Use Cases

### Use Case 1: Bank Payment Notification

**Backend:**
```javascript
// When super admin records payment for bank
const payment = await recordBankPayment(bankId, amount);

// Notify the bank admin
io.to(`user:${bank.adminUserId}`).emit('notification', {
  id: `payment-${payment._id}`,
  title: 'Monthly Subscription Activated ✅',
  message: `Your subscription has been activated for ${new Date().getFullYear()}`,
  type: 'success',
  read: false,
  createdAt: new Date().toISOString(),
  data: {
    paymentId: payment._id,
    bankId,
    amount,
  },
});

// Notify all super admins of the transaction
io.to('role:superadmin').emit('system_alert', {
  title: 'Payment Recorded',
  message: `Payment of $${amount} recorded for ${bank.name}`,
  type: 'info',
});
```

**Frontend Console:**
```
[Socket] 📬 Notification: Monthly Subscription Activated ✅
[Socket] ⚠️ System Alert: Payment Recorded
```

### Use Case 2: Loan Application Status

**Backend:**
```javascript
// When loan is approved
const customer = await getCustomer(loanApplication.customerId);

io.to(`user:${customer.userId}`).emit('notification', {
  id: `loan-${loanApplication._id}`,
  title: 'Loan Approved! 🎉',
  message: 'Your loan application has been approved',
  type: 'success',
  read: false,
  createdAt: new Date().toISOString(),
  data: {
    loanId: loanApplication._id,
    amount: loanApplication.amount,
  },
});
```

### Use Case 3: Real-Time Dashboard

**Backend:**
```javascript
// Update every 30 seconds
setInterval(() => {
  const stats = {
    totalRevenue: calculateTotalRevenue(),
    activeSubscriptions: countActiveSubscriptions(),
    pendingLoans: countPendingLoans(),
  };

  io.to('role:superadmin').emit('stats_update', {
    metric: 'dashboard_stats',
    value: stats,
    timestamp: new Date().toISOString(),
  });
}, 30000);
```

---

## 🐛 Troubleshooting

### Socket Not Connecting

**Check:**
1. ✅ `VITE_ENABLE_REAL_TIME=true` in `.env.development`
2. ✅ Backend Socket.io server is running
3. ✅ `VITE_SOCKET_URL` points to correct backend
4. ✅ User is logged in (socket only connects when authenticated)

**Debug:**
```javascript
// In console
const { socketService } = await import('src/services/socket');
console.log('Connected:', socketService.isConnected());
```

### Notifications Not Appearing

**Check:**
1. ✅ `VITE_ENABLE_NOTIFICATIONS=true` in `.env.development`
2. ✅ Backend is emitting with correct event name: `notification`
3. ✅ User ID matches in socket.join and io.to

**Debug:**
```javascript
// In backend, verify socket is in room
console.log(socket.rooms); // Should include 'user:USER_ID'
```

### 401 Error Not Logging Out

**Check:**
1. ✅ Backend returns status code `401`
2. ✅ Not `400` or other error code
3. ✅ API response includes proper error format

**Test:**
```javascript
// In browser console
const { callAPi } = await import('src/redux/services/http-common');
callAPi.get('/api/test'); // This should trigger 401 if token is invalid
```

---

## 📚 API Reference

### Socket Service Methods

```typescript
// Update authentication token
socketService.updateAuth(token: string | null): void

// Connect to socket server (idempotent)
socketService.connect(): void

// Disconnect from socket server
socketService.disconnect(): void

// Check if connected
socketService.isConnected(): boolean

// Emit event to server
socketService.emit(event: string, data?: any): void

// Listen to event (returns unsubscribe function)
socketService.on<T>(event: string, callback: (data: T) => void): () => void

// Remove event listener
socketService.off(event: string, callback?: (...args: any[]) => void): void
```

### Hook Usage

```typescript
import { useSocket } from 'src/providers/socket.provider';

const { isConnected, emit, on, off } = useSocket();
```

---

## ✨ That's It!

Your Socket.io notifications are now:

- ✅ Simple to set up
- ✅ Seamlessly integrated with auth
- ✅ Type-safe with TypeScript
- ✅ Production-ready
- ✅ Easy to test and debug

**Next Step:** Implement notification UI component (optional) or emit test notifications from your backend to verify everything works.

Happy real-time communication! 🚀
