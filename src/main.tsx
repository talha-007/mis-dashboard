import "react-toastify/dist/ReactToastify.css";

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ToastContainer } from "react-toastify";
import { Outlet, RouterProvider, createBrowserRouter } from 'react-router';

import App from './app';
import { AppProviders } from './providers';
import { routesSection } from './routes/sections';
import { ErrorBoundary } from './routes/components';
import { AuthInitializer } from './components/auth';
// ----------------------------------------------------------------------

const router = createBrowserRouter([
  {
    Component: () => (
      <App>
        <Outlet />
      </App>
    ),
    errorElement: <ErrorBoundary />,
    children: routesSection,
  },
]);

const root = createRoot(document.getElementById('root')!);

root.render(
  <StrictMode>
    <AppProviders>
      <AuthInitializer>
        <RouterProvider router={router} />
      </AuthInitializer>
      <ToastContainer />
    </AppProviders>
  </StrictMode>
);
