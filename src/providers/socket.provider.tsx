/**
 * Socket Provider
 * Manages socket connection and real-time events (notifications)
 */

import type { StatsUpdatePayload, NotificationPayload } from 'src/services/socket';

import { useMemo, useEffect, useContext, createContext, type ReactNode } from 'react';

import ENV from 'src/config/environment';
import { useAppSelector } from 'src/store';
import { SocketEvent, socketService } from 'src/services/socket';

interface SocketContextValue {
  isConnected: boolean;
  emit: typeof socketService.emit;
  on: typeof socketService.on;
  off: typeof socketService.off;
}

const SocketContext = createContext<SocketContextValue | null>(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const { isAuthenticated, token, isInitialized } = useAppSelector((state) => state.auth);

  // Connect/disconnect socket based on auth state
  useEffect(() => {
    // If not ready, no token, or feature disabled - disconnect
    if (!isInitialized || !isAuthenticated || !token || !ENV.FEATURES.REAL_TIME) {
      socketService.disconnect();
      return undefined;
    }

    // Update token and connect
    socketService.updateAuth(token);
    socketService.connect();

    // Setup event handlers
    const unsubscribers: Array<() => void> = [];

    // Handle notifications
    if (ENV.FEATURES.NOTIFICATIONS) {
      unsubscribers.push(
        socketService.on<NotificationPayload>(SocketEvent.NOTIFICATION, (notification) => {
          console.log('[Socket] 📬 Notification:', notification.title);
          // TODO: Dispatch to Redux notifications slice when created
        })
      );
    }

    // Handle system alerts
    unsubscribers.push(
      socketService.on<any>(SocketEvent.SYSTEM_ALERT, (alert) => {
        console.log('[Socket] ⚠️ System Alert:', alert.message);
        // TODO: Dispatch to Redux notifications slice when created
      })
    );

    // Handle stats updates
    if (ENV.FEATURES.ANALYTICS) {
      unsubscribers.push(
        socketService.on<StatsUpdatePayload>(SocketEvent.STATS_UPDATE, (stats) => {
          console.log('[Socket] 📊 Stats Update:', stats.metric, '=', stats.value);
          // TODO: Dispatch to Redux stats slice when created
        })
      );
    }

    // Cleanup on unmount or auth/token change
    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [isAuthenticated, isInitialized, token]);

  const contextValue: SocketContextValue = useMemo(
    () => ({
      isConnected: socketService.isConnected(),
      emit: socketService.emit.bind(socketService),
      on: socketService.on.bind(socketService),
      off: socketService.off.bind(socketService),
    }),
    [isAuthenticated, token]
  );

  return <SocketContext.Provider value={contextValue}>{children}</SocketContext.Provider>;
}
