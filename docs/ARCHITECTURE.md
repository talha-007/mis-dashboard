# MIS Dashboard Architecture

## Overview

The MIS Dashboard is built with a scalable, enterprise-ready architecture using React, Redux Toolkit, and Socket.io for real-time functionality.

## Tech Stack

- **Frontend Framework**: React 19 with TypeScript
- **UI Library**: Material-UI (MUI) v7
- **State Management**: Redux Toolkit
- **API Client**: Axios with interceptors
- **Real-time Communication**: Socket.io
- **Build Tool**: Vite.js
- **Code Quality**: ESLint v9, Prettier

## Architecture Layers

### 1. Presentation Layer (`src/pages`, `src/sections`, `src/layouts`)
- React components organized by feature
- Material-UI components for consistent design
- Responsive layouts for all screen sizes

### 2. Business Logic Layer (`src/store`)
- Redux Toolkit for state management
- Slices for different domains (auth, notifications, stats, ui)
- Async thunks for API operations
- Typed hooks for type-safe state access

### 3. Service Layer (`src/services`)
- **API Service**: Axios-based HTTP client with interceptors
- **Socket Service**: Socket.io client for real-time communication
- Centralized error handling
- Request/response transformation

### 4. Data Layer
- localStorage for authentication tokens
- Redux store for application state
- Real-time data via WebSocket

## Directory Structure

```
src/
├── config/              # Environment configuration
├── services/            # API and Socket services
│   ├── api/            # REST API services
│   │   ├── types.ts
│   │   ├── axios-instance.ts
│   │   ├── base-api.service.ts
│   │   └── endpoints/
│   └── socket/         # Socket.io service
├── store/              # Redux store
│   ├── index.ts        # Store configuration
│   └── slices/         # Redux slices
│       ├── auth.slice.ts
│       ├── notifications.slice.ts
│       ├── stats.slice.ts
│       └── ui.slice.ts
├── providers/          # React context providers
│   ├── socket.provider.tsx
│   └── index.tsx
├── hooks/              # Custom React hooks
│   ├── use-auth.ts
│   ├── use-notifications.ts
│   ├── use-stats.ts
│   └── use-api.ts
├── utils/              # Utility functions
├── components/         # Reusable components
├── layouts/            # Layout components
├── pages/              # Page components
├── sections/           # Feature sections
└── routes/             # Routing configuration
```

## State Management

### Redux Store Structure

```typescript
{
  auth: {
    user: User | null,
    token: string | null,
    isAuthenticated: boolean,
    isLoading: boolean,
    error: string | null
  },
  notifications: {
    items: Notification[],
    unreadCount: number,
    isLoading: boolean
  },
  stats: {
    metrics: Record<string, StatMetric>,
    analytics: Record<string, AnalyticsData>,
    isLoading: boolean,
    lastUpdate: string | null
  },
  ui: {
    sidebarOpen: boolean,
    sidebarCollapsed: boolean,
    theme: 'light' | 'dark' | 'auto',
    modals: Record<string, boolean>,
    loading: Record<string, boolean>
  }
}
```

## API Service Architecture

### BaseApiService
Generic CRUD operations for all API endpoints:
- `getAll()` - Fetch all items
- `getPaginated()` - Fetch paginated items
- `getById()` - Fetch single item
- `create()` - Create new item
- `update()` - Update item
- `patch()` - Partially update item
- `delete()` - Delete item

### Request Interceptors
- Add authentication token
- Log requests in development
- Transform request data

### Response Interceptors
- Handle authentication errors (401)
- Handle authorization errors (403)
- Transform response data
- Centralized error handling

## Socket.io Architecture

### Connection Management
- Auto-connect on authentication
- Auto-reconnect on disconnect
- Token-based authentication
- Connection state tracking

### Event System
- Type-safe event handlers
- Subscription management
- Event-to-Redux integration

### Real-time Features
1. **Notifications**: Real-time notification delivery
2. **Stats Updates**: Live metrics and analytics
3. **User Status**: Online/offline status tracking
4. **System Messages**: System-wide announcements

## Authentication Flow

1. User submits credentials
2. API call to `/auth/login`
3. Store token in localStorage
4. Update Redux state
5. Connect Socket.io with token
6. Redirect to dashboard

## Custom Hooks

### useAuth
- Authentication operations
- User state access
- Login/logout/register

### useNotifications
- Notification management
- Mark as read/unread
- Clear notifications

### useStats
- Access real-time metrics
- Access analytics data
- Clear metrics

### useApi
- Generic API call wrapper
- Loading/error states
- Success/error callbacks

## Security Considerations

1. **Token Storage**: Tokens stored in localStorage
2. **Token Refresh**: Auto-refresh on expiry
3. **Request Signing**: Bearer token authentication
4. **XSS Protection**: React's built-in protection
5. **CORS**: Configured on backend

## Performance Optimizations

1. **Code Splitting**: Route-based code splitting
2. **Lazy Loading**: Components loaded on demand
3. **Memoization**: React.memo for expensive components
4. **Virtual Scrolling**: For large lists
5. **Debouncing**: Search and filter operations

## Scalability Features

1. **Modular Architecture**: Easy to add new features
2. **Generic Services**: BaseApiService for all endpoints
3. **Type Safety**: Full TypeScript support
4. **Feature Flags**: Environment-based feature toggles
5. **Error Boundaries**: Graceful error handling

## Environment Configuration

Configuration through environment variables:
- API endpoints
- Socket.io configuration
- Feature flags
- App metadata

## Development Workflow

1. Create feature branch
2. Implement feature with tests
3. Run linting and formatting
4. Create pull request
5. Code review
6. Merge to main

## Deployment

1. Build production bundle: `npm run build`
2. Deploy to hosting service
3. Configure environment variables
4. Monitor logs and errors

## Best Practices

1. **Component Structure**: Small, focused components
2. **Type Safety**: Use TypeScript for all code
3. **Error Handling**: Try-catch in async operations
4. **Loading States**: Show loading indicators
5. **Code Formatting**: Use Prettier
6. **Code Linting**: Use ESLint
7. **Git Commits**: Conventional commit messages

## Future Enhancements

1. Offline support with service workers
2. Push notifications
3. Advanced caching strategies
4. GraphQL integration option
5. Micro-frontend architecture
6. A/B testing framework
