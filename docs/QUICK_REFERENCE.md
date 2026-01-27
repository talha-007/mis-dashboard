# Quick Reference Guide

## File Structure

```
src/
├── config/
│   └── environment.ts          # Environment configuration
├── services/
│   ├── api/
│   │   ├── types.ts            # API types
│   │   ├── axios-instance.ts   # Axios setup
│   │   ├── base-api.service.ts # Base CRUD service
│   │   ├── endpoints/          # API endpoints
│   │   └── index.ts
│   └── socket/
│       ├── types.ts            # Socket types
│       ├── socket.service.ts   # Socket.io client
│       └── index.ts
├── store/
│   ├── index.ts                # Store configuration
│   └── slices/
│       ├── auth.slice.ts       # Authentication state
│       ├── notifications.slice.ts
│       ├── stats.slice.ts
│       └── ui.slice.ts
├── providers/
│   ├── socket.provider.tsx     # Socket context
│   └── index.tsx               # All providers
├── hooks/
│   ├── use-auth.ts             # Auth hook
│   ├── use-notifications.ts
│   ├── use-stats.ts
│   ├── use-api.ts              # Generic API hook
│   └── index.ts
└── utils/
    └── auth-storage.ts         # Token storage
```

## Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run start           # Preview production build

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint errors
npm run fm:check        # Check Prettier formatting
npm run fm:fix          # Fix Prettier formatting
npm run fix:all         # Fix all linting and formatting

# TypeScript
npm run tsc:watch       # Watch TypeScript errors
npm run tsc:dev         # Dev with TypeScript watch
```

## Authentication

```typescript
import { useAuth } from 'src/hooks';

const { user, isAuthenticated, login, logout, register } = useAuth();

// Login
await login({ email: 'user@example.com', password: 'pass' });

// Logout
await logout();

// Register
await register({ email, password, firstName, lastName });
```

## API Calls

### Quick API Call

```typescript
import { authService, usersService } from 'src/services/api';

// Simple call
const users = await usersService.getAll();
const user = await usersService.getById('123');
await usersService.create({ name: 'John' });
await usersService.update('123', { name: 'Jane' });
await usersService.delete('123');
```

### With Loading State

```typescript
import { useApi } from 'src/hooks';

const { data, loading, error, execute } = useApi(usersService.getAll);

useEffect(() => {
  execute();
}, []);
```

### Create New API Service

```typescript
// src/services/api/endpoints/products.service.ts
import { BaseApiService } from '../base-api.service';

interface Product {
  id: string;
  name: string;
  price: number;
}

class ProductsService extends BaseApiService<Product> {
  constructor() {
    super('/products');
  }
}

export const productsService = new ProductsService();
```

## Socket.io

### Subscribe to Events

```typescript
import { useSocket } from 'src/providers';

const { isConnected, on, emit } = useSocket();

useEffect(() => {
  const unsubscribe = on('event_name', (data) => {
    console.log(data);
  });
  return unsubscribe;
}, []);
```

### Emit Events

```typescript
emit('event_name', { data: 'value' });
```

## Redux

### Access State

```typescript
import { useAppSelector } from 'src/store';

const user = useAppSelector((state) => state.auth.user);
const notifications = useAppSelector((state) => state.notifications.items);
```

### Dispatch Actions

```typescript
import { useAppDispatch } from 'src/store';
import { openModal } from 'src/store/slices/ui.slice';

const dispatch = useAppDispatch();
dispatch(openModal('settings'));
```

## Notifications

```typescript
import { useNotifications } from 'src/hooks';

const {
  notifications,
  unreadCount,
  markAsRead,
  markAllAsRead,
  removeNotification,
} = useNotifications();

markAsRead('notification-id');
markAllAsRead();
removeNotification('notification-id');
```

## Stats

```typescript
import { useStats } from 'src/hooks';

const { metrics, analytics, getMetric } = useStats();

const totalUsers = getMetric('total_users');
// { id, name, value, change, changePercentage, lastUpdated }
```

## Environment Variables

```typescript
import ENV from 'src/config/environment';

ENV.API.BASE_URL          // API URL
ENV.SOCKET.URL            // Socket URL
ENV.APP.NAME              // App name
ENV.FEATURES.REAL_TIME    // Feature flag
ENV.IS_DEV                // Is development
ENV.IS_PROD               // Is production
```

## TypeScript Types

### API Response

```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}
```

### Redux State

```typescript
import { RootState } from 'src/store';

// Access in component
const user = useAppSelector((state: RootState) => state.auth.user);
```

### Socket Events

```typescript
import { SocketEvent } from 'src/services/socket';

SocketEvent.CONNECT
SocketEvent.DISCONNECT
SocketEvent.NOTIFICATION
SocketEvent.STATS_UPDATE
```

## Common Patterns

### Protected Route

```typescript
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/sign-in" />;
}
```

### Loading State

```typescript
function Component() {
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    setLoading(true);
    try {
      await apiCall();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  return <Content />;
}
```

### Error Handling

```typescript
try {
  const result = await apiCall();
} catch (error: any) {
  if (error.status === 401) {
    // Unauthorized
  } else if (error.status === 403) {
    // Forbidden
  } else {
    // Other error
    console.error(error.message);
  }
}
```

## Useful Snippets

### Async Thunk (Redux)

```typescript
export const fetchData = createAsyncThunk(
  'slice/fetchData',
  async (params, { rejectWithValue }) => {
    try {
      const response = await apiService.getData(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);
```

### Custom Hook

```typescript
export const useCustomHook = () => {
  const [state, setState] = useState(null);

  const action = useCallback(async () => {
    const result = await apiCall();
    setState(result);
  }, []);

  return { state, action };
};
```

### Socket Listener

```typescript
useEffect(() => {
  const unsubscribe = socketService.on('event', (data) => {
    // Handle event
  });
  return () => unsubscribe();
}, []);
```

## Debugging

### Redux DevTools

- Install Redux DevTools browser extension
- Open browser DevTools → Redux tab
- View state, actions, and time-travel debugging

### Network Requests

- Browser DevTools → Network tab
- Filter by XHR for API calls
- Filter by WS for WebSocket

### Console Logs

```typescript
// Development only logs
if (ENV.IS_DEV) {
  console.log('Debug info:', data);
}
```

## Performance Tips

1. Use `React.memo` for expensive components
2. Use `useCallback` for event handlers
3. Use `useMemo` for computed values
4. Lazy load routes and components
5. Virtualize long lists
6. Debounce search inputs
7. Paginate large datasets

## Security Best Practices

1. Never commit `.env` files
2. Store tokens in httpOnly cookies (if possible)
3. Validate all user inputs
4. Sanitize data before rendering
5. Use HTTPS in production
6. Implement rate limiting
7. Keep dependencies updated

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Commit changes
git add .
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/new-feature

# Create pull request
# Get code review
# Merge to main
```

## Troubleshooting

### Build Fails
- Clear `node_modules` and reinstall
- Check for TypeScript errors
- Verify all imports are correct

### Socket Won't Connect
- Check backend is running
- Verify Socket URL in `.env`
- Check authentication token

### API Calls Fail
- Check backend is running
- Verify API URL in `.env`
- Check CORS configuration
- Verify authentication token

### State Not Updating
- Check Redux DevTools
- Verify actions are dispatched
- Check reducers are properly defined
- Ensure store is properly configured
