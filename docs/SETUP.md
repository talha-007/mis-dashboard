# Setup Guide

## Prerequisites

- Node.js v20.x or higher
- npm or yarn package manager
- Git

## Installation

### 1. Install Dependencies

```bash
npm install
# or
yarn install
```

### 2. Environment Configuration

Create environment files in the root directory:

**.env.development** (for development)
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api
VITE_API_TIMEOUT=30000

# WebSocket Configuration
VITE_SOCKET_URL=http://localhost:5000
VITE_SOCKET_PATH=/socket.io
VITE_SOCKET_RECONNECTION_ATTEMPTS=5
VITE_SOCKET_RECONNECTION_DELAY=3000

# App Configuration
VITE_APP_NAME=MIS Dashboard
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=development

# Feature Flags
VITE_ENABLE_REAL_TIME=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_ANALYTICS=true
```

**.env.production** (for production)
```env
# API Configuration
VITE_API_BASE_URL=https://api.yourdomain.com/api
VITE_API_TIMEOUT=30000

# WebSocket Configuration
VITE_SOCKET_URL=https://api.yourdomain.com
VITE_SOCKET_PATH=/socket.io
VITE_SOCKET_RECONNECTION_ATTEMPTS=5
VITE_SOCKET_RECONNECTION_DELAY=3000

# App Configuration
VITE_APP_NAME=MIS Dashboard
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=production

# Feature Flags
VITE_ENABLE_REAL_TIME=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_ANALYTICS=true
```

### 3. Start Development Server

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3039`

## Backend Setup

You'll need a backend server that supports:

### REST API Endpoints

```
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/logout
GET    /api/auth/me
POST   /api/auth/refresh
GET    /api/users
GET    /api/users/:id
POST   /api/users
PUT    /api/users/:id
PATCH  /api/users/:id
DELETE /api/users/:id
```

### WebSocket Events

The backend should emit these events:

**Server → Client**
- `authenticated` - When user is authenticated
- `unauthorized` - When authentication fails
- `notification` - New notification
- `stats:update` - Stats update
- `analytics:update` - Analytics update
- `system:message` - System message
- `system:alert` - System alert

**Client → Server**
- `authenticate` - Send authentication token
- `notification:read` - Mark notification as read
- `notification:delete` - Delete notification

### Example Backend (Node.js/Express/Socket.io)

```javascript
// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3039',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// REST API Routes
app.post('/api/auth/login', (req, res) => {
  // Your login logic
  res.json({
    success: true,
    data: {
      user: { id: '1', email: 'user@example.com', firstName: 'John', lastName: 'Doe' },
      token: 'jwt-token-here',
      expiresIn: 3600,
    },
  });
});

// Socket.io
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  // Verify token
  if (token) {
    next();
  } else {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.emit('authenticated', { success: true });

  // Send notifications
  setInterval(() => {
    socket.emit('notification', {
      id: Date.now().toString(),
      title: 'New Notification',
      message: 'This is a test notification',
      type: 'info',
      read: false,
      createdAt: new Date().toISOString(),
    });
  }, 10000);

  // Send stats updates
  setInterval(() => {
    socket.emit('stats:update', {
      metric: 'total_users',
      value: Math.floor(Math.random() * 1000),
      change: Math.floor(Math.random() * 50),
      changePercentage: (Math.random() * 10).toFixed(2),
      timestamp: new Date().toISOString(),
    });
  }, 5000);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});
```

## Testing the Setup

### 1. Test API Connection

```typescript
import { authService } from 'src/services/api';

// In a component or test file
const testApi = async () => {
  try {
    const response = await authService.login({
      email: 'test@example.com',
      password: 'password',
    });
    console.log('API Connection successful:', response);
  } catch (error) {
    console.error('API Connection failed:', error);
  }
};
```

### 2. Test Socket Connection

```typescript
import { socketService } from 'src/services/socket';

// After authentication
socketService.connect();

socketService.on('connect', () => {
  console.log('Socket connected successfully');
});

socketService.on('notification', (data) => {
  console.log('Received notification:', data);
});
```

## Troubleshooting

### CORS Errors

If you see CORS errors, make sure your backend has proper CORS configuration:

```javascript
app.use(cors({
  origin: 'http://localhost:3039',
  credentials: true,
}));
```

### Socket Connection Issues

1. Check that the backend is running
2. Verify the Socket URL in `.env` file
3. Check browser console for connection errors
4. Ensure authentication token is valid

### Build Errors

If you encounter build errors:

```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install

# Clear cache
npm cache clean --force
```

## Production Build

```bash
# Build for production
npm run build
# or
yarn build

# Preview production build
npm run start
# or
yarn start
```

The build output will be in the `dist/` directory.

## Deployment

### Using Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts

### Using Netlify

1. Build: `npm run build`
2. Deploy `dist/` folder to Netlify

### Using Docker

```dockerfile
# Dockerfile
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:
```bash
docker build -t mis-dashboard .
docker run -p 80:80 mis-dashboard
```

## Next Steps

1. Configure your backend API endpoints
2. Set up authentication flow
3. Add custom API services for your features
4. Customize Redux slices for your data models
5. Create custom Socket.io events
6. Build your dashboard components

For more information, see:
- [Architecture Documentation](./ARCHITECTURE.md)
- [Usage Examples](./USAGE_EXAMPLES.md)
