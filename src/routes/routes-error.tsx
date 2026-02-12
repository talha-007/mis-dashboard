/**
 * Error Routes
 * Routes for error pages (unauthorized, not found, etc.)
 */

import type { RouteObject } from 'react-router';

import { lazy } from 'react';

// Import pages directly from their source, not from sections (avoid circular deps)
const UnauthorizedPage = lazy(() => import('src/pages/error/unauthorized'));
const Page404 = lazy(() => import('src/pages/error/page-not-found'));

export const errorRoutes: RouteObject[] = [
  {
    path: 'unauthorized',
    element: <UnauthorizedPage />,
  },
  {
    path: '404',
    element: <Page404 />,
  },
  { path: '*', element: <Page404 /> },
];
