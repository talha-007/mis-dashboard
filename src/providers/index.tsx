/**
 * Providers Index
 * Combines all providers for the app
 */

import type { ReactNode } from 'react';

import { HelmetProvider } from 'react-helmet-async';
import { Provider as ReduxProvider } from 'react-redux';

import { store } from 'src/redux/store';

import { SocketProvider } from './socket.provider';
import { GoogleOAuthWrapper } from './google-oauth.provider';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <HelmetProvider>
      <ReduxProvider store={store}>
        <GoogleOAuthWrapper>
          <SocketProvider>{children}</SocketProvider>
        </GoogleOAuthWrapper>
      </ReduxProvider>
    </HelmetProvider>
  );
}

export * from './socket.provider';
export * from './google-oauth.provider';
