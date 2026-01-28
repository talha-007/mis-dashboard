/**
 * Socket Provider
 * Manages socket connection and real-time events
 */

import type { StatsUpdatePayload, NotificationPayload } from 'src/services/socket';

import { useMemo, useEffect, useContext, createContext, type ReactNode } from 'react';

import ENV from 'src/config/environment';
import { useAppDispatch, useAppSelector } from 'src/store';
import { SocketEvent, socketService } from 'src/services/socket';
import { addNotification } from 'src/store/slices/notifications.slice';
import { updateMetric, updateAnalytics } from 'src/store/slices/stats.slice';

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
  const dispatch = useAppDispatch();
  const { isAuthenticated, token, isInitialized } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Early return if not ready
    if (!isInitialized || !isAuthenticated || !token || !ENV.FEATURES.REAL_TIME) {
      return undefined;
    }

    // Connect socket with auth
    socketService.updateAuth(token);
    socketService.connect();

    // Setup event handlers
    const unsubscribers: Array<() => void> = [];

    // Notifications
    if (ENV.FEATURES.NOTIFICATIONS) {
      unsubscribers.push(
        socketService.on<NotificationPayload>(SocketEvent.NOTIFICATION, (notification) => {
          dispatch(
            addNotification({
              ...notification,
              createdAt: notification.createdAt || new Date().toISOString(),
            })
          );
        })
      );
    }

    // Analytics
    if (ENV.FEATURES.ANALYTICS) {
      unsubscribers.push(
        socketService.on<StatsUpdatePayload>(SocketEvent.STATS_UPDATE, (stats) => {
          dispatch(updateMetric(stats));
        }),
        socketService.on<any>(SocketEvent.ANALYTICS_UPDATE, (data) => {
          dispatch(updateAnalytics(data));
        })
      );
    }

    // System messages & alerts
    unsubscribers.push(
      socketService.on<any>(SocketEvent.SYSTEM_MESSAGE, (message) => {
        console.log('[System Message]', message);
      }),
      socketService.on<any>(SocketEvent.SYSTEM_ALERT, (alert) => {
        dispatch(
          addNotification({
            id: `alert-${Date.now()}`,
            title: 'System Alert',
            message: alert.message || 'System alert received',
            type: alert.type || 'warning',
            read: false,
            createdAt: new Date().toISOString(),
            data: alert,
          })
        );
      })
    );

    // Cleanup on unmount or auth/token change
    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
      socketService.disconnect();
    };
  }, [dispatch, isAuthenticated, isInitialized, token]);

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
