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

## License

Distributed under the MIT license.

---

_Based on Minimal UI template by minimals.cc_
