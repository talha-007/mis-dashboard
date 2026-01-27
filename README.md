# MIS Dashboard

![license](https://img.shields.io/badge/license-MIT-blue.svg)

> Management Information System Dashboard built with Material-UI components, React, TypeScript, and Vite.js.

## Features

- **Dashboard** - Analytics and overview
- **Users** - User management
- **Products** - Product catalog
- **Blog** - Content management
- **Authentication** - Sign in/Sign up
- **Error handling** - 404 pages

## Tech Stack

- React 19
- Material-UI (MUI) v7
- TypeScript
- Vite.js
- React Router v7
- ApexCharts for data visualization
- ESLint v9 & Prettier

## Quick Start

### Prerequisites

- Node.js v20.x or higher
- npm or yarn package manager

### Installation

```bash
# Install dependencies
npm install
# or
yarn install
```

### Development

```bash
# Start development server
npm run dev
# or
yarn dev
```

Open browser at: `http://localhost:3039`

### Build

```bash
# Build for production
npm run build
# or
yarn build
```

### Other Commands

```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code with Prettier
npm run fm:fix

# Fix all (lint + format)
npm run fix:all

# Type checking
npm run tsc:watch
```

## Project Structure

```
src/
├── components/      # Reusable UI components
├── layouts/         # Layout components (dashboard, auth)
├── pages/          # Page components
├── sections/       # Page sections
├── routes/         # Routing configuration
├── theme/          # MUI theme configuration
├── utils/          # Utility functions
└── _mock/          # Mock data
```

## Documentation

Comprehensive documentation is available in the `docs/` folder:

- **[Setup Guide](docs/SETUP.md)** - Installation and configuration
- **[Architecture](docs/ARCHITECTURE.md)** - System architecture and design patterns
- **[Usage Examples](docs/USAGE_EXAMPLES.md)** - Code examples and patterns
- **[Quick Reference](docs/QUICK_REFERENCE.md)** - Quick lookup for common tasks

## Features

### ✅ Implemented

- **Redux Toolkit** - Modern state management
- **API Services** - Scalable REST API integration with axios
- **Socket.io** - Real-time WebSocket communication
- **Authentication** - Complete auth flow with JWT
- **Notifications** - Real-time notification system
- **Statistics** - Live dashboard metrics and analytics
- **TypeScript** - Full type safety
- **Error Handling** - Centralized error management
- **Custom Hooks** - Reusable React hooks

### 🎯 Enterprise Ready

- Scalable architecture
- Modular service layer
- Generic API service pattern
- Real-time data synchronization
- Environment-based configuration
- Type-safe throughout
- Production-ready build

## State Management

The application uses Redux Toolkit with the following slices:
- `auth` - User authentication and profile
- `notifications` - Real-time notifications
- `stats` - Live statistics and analytics
- `ui` - UI state (sidebar, modals, theme)

## Real-time Features

Socket.io integration provides:
- Live notifications
- Real-time statistics updates
- User presence tracking
- System alerts
- Auto-reconnection

## API Services

Modular API service architecture:
- `authService` - Authentication endpoints
- `usersService` - User management
- `BaseApiService` - Generic CRUD operations

Add new services by extending `BaseApiService`:

```typescript
class ProductsService extends BaseApiService<Product> {
  constructor() {
    super('/products');
  }
}
```

## License

Distributed under the MIT license.

---

_Based on Minimal UI template by minimals.cc_
