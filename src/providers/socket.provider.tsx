/**
 * Socket Provider
 * Manages socket connection and real-time events
 */

import type { StatsUpdatePayload, NotificationPayload } from 'src/services/socket';

import { useEffect, useContext, createContext, type ReactNode } from 'react';

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
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Only connect if authenticated and real-time is enabled
    if (isAuthenticated && ENV.FEATURES.REAL_TIME) {
      socketService.connect();

      // Setup global event handlers
      setupEventHandlers();

      return () => {
      socketService.disconnect();
    };
  }

  return undefined;
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [isAuthenticated]);

const setupEventHandlers = () => {
    // Handle incoming notifications
    if (ENV.FEATURES.NOTIFICATIONS) {
      socketService.on<NotificationPayload>(SocketEvent.NOTIFICATION, (notification) => {
        dispatch(
          addNotification({
            ...notification,
            createdAt: notification.createdAt || new Date().toISOString(),
          })
        );
      });
    }

    // Handle stats updates
    if (ENV.FEATURES.ANALYTICS) {
      socketService.on<StatsUpdatePayload>(SocketEvent.STATS_UPDATE, (stats) => {
        dispatch(updateMetric(stats));
      });

      socketService.on<any>(SocketEvent.ANALYTICS_UPDATE, (data) => {
        dispatch(updateAnalytics(data));
      });
    }

    // Handle system messages
    socketService.on<any>(SocketEvent.SYSTEM_MESSAGE, (message) => {
      console.log('[System Message]', message);
    });

    // Handle system alerts
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
    });
  };

  const contextValue: SocketContextValue = {
    isConnected: socketService.isConnected(),
    emit: socketService.emit.bind(socketService),
    on: socketService.on.bind(socketService),
    off: socketService.off.bind(socketService),
  };

  return <SocketContext.Provider value={contextValue}>{children}</SocketContext.Provider>;
}
