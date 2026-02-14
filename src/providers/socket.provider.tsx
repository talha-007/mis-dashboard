/**
 * Socket Provider
 * Manages socket connection and real-time events (notifications)
 */

import type { StatsUpdatePayload, NotificationPayload } from 'src/services/socket';

import { useMemo, useState, useEffect, useContext, createContext, type ReactNode } from 'react';

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
  const { isAuthenticated, token, isInitialized, user } = useAppSelector((state) => state.auth);
  const [isConnected, setIsConnected] = useState(false);

  // Connect/disconnect socket based on auth state
  useEffect(() => {
    // If not ready, no token - disconnect
    if (!isInitialized || !isAuthenticated || !token) {
      socketService.disconnect();
      return undefined;
    }

    // Update token and connect
    socketService.updateAuth(token);
    socketService.connect();

    // Setup event handlers
    const unsubscribers: Array<() => void> = [];

    // Track connection state
    unsubscribers.push(
      socketService.on('connect', () => {
        console.log('[Socket] ✅ Connected');
        setIsConnected(true);
      })
    );

    unsubscribers.push(
      socketService.on('disconnect', () => {
        console.log('[Socket] ❌ Disconnected');
        setIsConnected(false);
      })
    );

    unsubscribers.push(
      socketService.on('reconnect', () => {
        console.log('[Socket] 🔄 Reconnected');
        setIsConnected(true);
      })
    );

    // Subscribe to notifications AFTER socket connects
    if (user?.id) {
      // Subscribe on initial connect
      unsubscribers.push(
        socketService.on('connect', () => {
          console.log('[Socket] 📢 Emitting subscribe_notifications for user:', user.id);
          socketService.subscribeToNotifications(user.id);
        })
      );

      // Also subscribe on reconnect
      unsubscribers.push(
        socketService.on('reconnect', () => {
          console.log('[Socket] 🔄 Reconnected! Resubscribing for user:', user.id);
          socketService.subscribeToNotifications(user.id);
        })
      );
    }

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
  }, [isAuthenticated, isInitialized, token, user?.id]);

  const contextValue: SocketContextValue = useMemo(
    () => ({
      isConnected,
      emit: socketService.emit.bind(socketService),
      on: socketService.on.bind(socketService),
      off: socketService.off.bind(socketService),
    }),
    [isConnected]
  );

  return <SocketContext.Provider value={contextValue}>{children}</SocketContext.Provider>;
}
