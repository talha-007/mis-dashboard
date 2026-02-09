# 🚀 Quick Start - Socket.io Notifications

## ⚡ Super Simple Setup

Your socket.io is now completely integrated. Just follow these 2 steps:

---

## Step 1: Environment Configuration

Add to `.env.development`:

```env
# Socket.io Configuration
VITE_SOCKET_URL=http://localhost:3001
VITE_SOCKET_PATH=/socket.io
VITE_ENABLE_REAL_TIME=true
VITE_ENABLE_NOTIFICATIONS=true

# API Configuration  
VITE_API_BASE_URL=http://localhost:5000/api
VITE_API_TIMEOUT=30000
```

---

## Step 2: Backend Socket.io Setup

Your backend needs Socket.io server. Here's the minimal setup:

### 2.1 Install Dependencies

```bash
npm install socket.io socket.io-client jsonwebtoken
```

### 2.2 Create Socket.io Server

**File:** `src/services/socket.js` (or similar)

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

// Authenticate socket connections
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    console.warn('Socket connection attempted without token');
    return next(new Error('Authentication error'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    socket.userRole = decoded.role;
    socket.userEmail = decoded.email;
    console.log(`✅ Socket auth success: ${decoded.id}`);
    next();
  } catch (error) {
    console.error('Socket auth failed:', error.message);
    next(new Error('Invalid token'));
  }
});

// Handle connections
io.on('connection', (socket) => {
  console.log(`👤 User connected: ${socket.userId}`);

  // Join user-specific room
  socket.join(`user:${socket.userId}`);
  
  // Join role-based room
  socket.join(`role:${socket.userRole}`);

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`👤 User disconnected: ${socket.userId}`);
  });
});

// Export for use in your API
module.exports = { io };

// Start server
const PORT = process.env.SOCKET_PORT || 3001;
server.listen(PORT, () => {
  console.log(`🔌 Socket.io server running on port ${PORT}`);
});
```

### 2.3 Emit Notifications

Anywhere in your backend where something important happens:

```javascript
const { io } = require('src/services/socket');

// Example: After recording bank payment
async function recordBankPayment(bankId, amount) {
  const payment = await Payment.create({
    bankId,
    amount,
    createdAt: new Date(),
  });

  const bank = await Bank.findById(bankId);

  // 📬 Send notification to bank admin
  io.to(`user:${bank.adminUserId}`).emit('notification', {
    id: `payment-${payment._id}`,
    title: '✅ Payment Recorded',
    message: `Monthly subscription activated. Next payment due: ${getNextPaymentDate()}`,
    type: 'success',
    read: false,
    createdAt: new Date().toISOString(),
    data: {
      paymentId: payment._id,
      bankId,
      amount,
    },
  });

  // ⚠️ Send alert to all super admins
  io.to('role:superadmin').emit('system_alert', {
    title: 'Bank Payment Processed',
    message: `$${amount} received from ${bank.name}`,
    type: 'info',
  });

  return payment;
}
```

---

## ✅ Testing It Works

### Test 1: Check Console Logs

1. **Frontend** (http://localhost:3039)
   - Login
   - Open DevTools Console
   - Should see: `[Socket] ✅ Connected successfully`

2. **Backend** 
   - Should see: `✅ Socket auth success: USER_ID_HERE`

### Test 2: Send a Test Notification

In your backend console/code:

```javascript
// Get any connected socket and emit notification
const sockets = Array.from(io.sockets.sockets.values());
if (sockets.length > 0) {
  sockets[0].emit('notification', {
    id: 'test-' + Date.now(),
    title: '🧪 Test Notification',
    message: 'If you see this, everything works!',
    type: 'success',
    read: false,
    createdAt: new Date().toISOString(),
  });
}
```

**Frontend Console should show:**
```
[Socket] 📬 Notification: 🧪 Test Notification
```

### Test 3: Test Auto-Logout on 401

1. Open DevTools Console
2. Run: `localStorage.removeItem('auth_token')`
3. Click any button that makes an API call
4. Console should show: `[API] 401 Unauthorized - logging out user`
5. Should redirect to `/sign-in`

### Test 4: Test Disconnect on Logout

1. Login
2. Console shows: `[Socket] ✅ Connected successfully`
3. Click Logout
4. Console shows: `[Socket] 🔌 Disconnecting...`
5. Redirects to `/sign-in`

---

## 🎯 Event Types You Can Send

### Notification (User-Specific)
```javascript
io.to(`user:${userId}`).emit('notification', {
  id: 'unique-id',                    // Required: unique identifier
  title: 'Action Completed',          // Required: short title
  message: 'Your request succeeded',  // Required: full message
  type: 'success',                    // Required: 'success', 'error', 'warning', 'info'
  read: false,                        // Required: unread status
  createdAt: new Date().toISOString(), // Optional: timestamp
  data: { /* any custom data */ },    // Optional: extra data
});
```

### System Alert (Role-Based)
```javascript
io.to('role:superadmin').emit('system_alert', {
  title: 'System Event',
  message: 'Something important happened',
  type: 'warning', // 'info', 'warning', 'error', 'success'
});
```

### Stats Update (Real-Time Dashboard)
```javascript
io.to(`user:${userId}`).emit('stats_update', {
  metric: 'total_revenue',
  value: 1250000,
  timestamp: new Date().toISOString(),
});
```

---

## 🐛 Common Issues & Solutions

### "Socket not connecting"

**Check list:**
- ✅ Backend Socket.io server is running on port 3001
- ✅ `VITE_SOCKET_URL=http://localhost:3001` in `.env.development`
- ✅ `VITE_ENABLE_REAL_TIME=true`
- ✅ User is logged in (socket only connects when authenticated)

**Debug:**
```javascript
// In browser console
const { ENV } = await import('src/config/environment');
console.log('Socket URL:', ENV.SOCKET.URL);
const { socketService } = await import('src/services/socket');
console.log('Connected?', socketService.isConnected());
```

### "Notifications not appearing"

**Check list:**
- ✅ Backend is emitting correct event: `notification`
- ✅ Correct user ID: `io.to('user:USER_ID')`
- ✅ `VITE_ENABLE_NOTIFICATIONS=true`

**Debug:**
```javascript
// In backend
io.on('connection', (socket) => {
  console.log('Rooms:', socket.rooms); // Should include 'user:123'
});
```

### "403 Forbidden errors not working"

**Check:**
- ✅ Backend returns exact status code `403`
- ✅ User has proper permission checks

**Debug:**
```javascript
// In browser console
const { callAPi } = await import('src/redux/services/http-common');
// Make request to endpoint you don't have access to
// Should redirect to /unauthorized
```

---

## 📊 Real-World Examples

### Example 1: Bank Payment Notification

```javascript
// Backend - after recording payment
io.to(`user:${bankAdminId}`).emit('notification', {
  id: `payment-${paymentId}`,
  title: '✅ Subscription Active',
  message: `Your monthly subscription is now active until ${endDate}`,
  type: 'success',
  read: false,
  createdAt: new Date().toISOString(),
});

// Frontend Console shows:
// [Socket] 📬 Notification: ✅ Subscription Active
```

### Example 2: Loan Approved

```javascript
// Backend
io.to(`user:${customerId}`).emit('notification', {
  id: `loan-${loanId}`,
  title: '🎉 Loan Approved!',
  message: 'Your loan of $10,000 has been approved',
  type: 'success',
  read: false,
  createdAt: new Date().toISOString(),
});
```

### Example 3: System Maintenance Alert

```javascript
// Backend - broadcast to all super admins
io.to('role:superadmin').emit('system_alert', {
  title: '⚠️ Maintenance Alert',
  message: 'System maintenance scheduled for 2:00 AM',
  type: 'warning',
});
```

---

## 🎉 You're Done!

Your Socket.io is now ready for:
- ✅ Real-time notifications
- ✅ System alerts
- ✅ Live dashboard updates
- ✅ User activity feeds

Just emit events from your backend and they'll show up in real-time on the frontend!

---

## 📚 Learn More

- **Socket Setup Guide:** `docs/SOCKET_SETUP_GUIDE.md`
- **Implementation Summary:** `docs/IMPLEMENTATION_SUMMARY.md`
- **Auth & RBAC Analysis:** `docs/AUTH_RBAC_SOCKET_INTEGRATION.md`

---

## 💬 Questions?

All the console logs help with debugging:
- 🟢 Green check = Good
- ❌ Red X = Problem
- ⚠️ Yellow warning = Heads up
- 📬 Blue envelope = Data received

Open DevTools Console, login, and watch the magic happen! 🚀
