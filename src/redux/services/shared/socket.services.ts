/**
 * Socket Service (Shared - real-time communication)
 * Manages Socket.io connection for notifications, stats updates, etc.
 */

import { io, type Socket } from 'socket.io-client';

import ENV from 'src/config/environment';

// Socket Events
export enum SocketEvent {
  CONNECT = 'connection',
  DISCONNECT = 'disconnect',
  NOTIFICATION = 'notification',
  STATS_UPDATE = 'stats_update',
  ANALYTICS_UPDATE = 'analytics_update',
  SYSTEM_MESSAGE = 'system_message',
  SYSTEM_ALERT = 'system_alert',
}

// Payload Types
export interface NotificationPayload {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt?: string;
  data?: any;
}

export interface StatsUpdatePayload {
  metric: string;
  value: number;
  timestamp: string;
}

class SocketService {
  private socket: Socket | null = null;
  private authToken: string | null = null;
  private isConnecting = false;
  private subscribedUserId: string | null = null;

  updateAuth(token: string | null) {
    this.authToken = token;
    if (this.socket) {
      this.socket.auth = { token };
    }
  }

  connect() {
    if (this.socket?.connected) {
      console.log('[Socket] Already connected');
      return;
    }
    if (this.isConnecting) {
      console.log('[Socket] Already connecting...');
      return;
    }
    if (!ENV.SOCKET.URL) {
      console.warn('[Socket] Socket URL not configured');
      return;
    }

    this.isConnecting = true;
    try {
      if (this.socket) this.socket.disconnect();
      this.socket = io(ENV.SOCKET.URL, {
        path: ENV.SOCKET.PATH,
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: ENV.SOCKET.RECONNECTION_ATTEMPTS,
        reconnectionDelay: ENV.SOCKET.RECONNECTION_DELAY,
        reconnectionDelayMax: 10000,
        auth: this.authToken ? { token: this.authToken } : undefined,
      });

      this.socket.on(SocketEvent.CONNECT, () => {
        console.log('[Socket] ✅ Connected successfully');
        this.isConnecting = false;
      });
      this.socket.on(SocketEvent.DISCONNECT, (reason) => {
        console.log('[Socket] ❌ Disconnected:', reason);
        this.isConnecting = false;
      });
      this.socket.on('connect_error', (error) => {
        console.warn('[Socket] ⚠️ Connection error:', error.message);
      });
      console.log('[Socket] 🔄 Initiating connection...');
    } catch (error) {
      console.error('[Socket] 💥 Failed to create socket:', error);
      this.isConnecting = false;
    }
  }

  disconnect() {
    if (this.socket) {
      console.log('[Socket] 🔌 Disconnecting...');
      this.socket.disconnect();
      this.socket = null;
      this.subscribedUserId = null;
      this.isConnecting = false;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  subscribeToNotifications(userId: string) {
    if (this.subscribedUserId === userId) return;
    if (this.socket?.connected) {
      this.socket.emit('subscribe_notifications', { userId });
      this.subscribedUserId = userId;
    } else {
      console.warn('[Socket] Cannot subscribe - socket not connected');
    }
  }

  emit(event: string, data?: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('[Socket] Cannot emit - socket not connected:', event);
    }
  }

  on<T = any>(event: string, callback: (data: T) => void): () => void {
    if (this.socket) {
      this.socket.on(event, callback);
      return () => {
        if (this.socket) this.socket.off(event, callback);
      };
    }
    return () => {};
  }

  off(event: string, callback?: (...args: any[]) => void) {
    if (this.socket) {
      if (callback) this.socket.off(event, callback);
      else this.socket.removeAllListeners(event);
    }
  }
}

export const socketService = new SocketService();
