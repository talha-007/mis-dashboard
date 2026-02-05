/**
 * Socket Service
 * Manages Socket.io connection and real-time communication
 */

import { io, type Socket } from 'socket.io-client';

import ENV from 'src/config/environment';

// Socket Events
export enum SocketEvent {
  CONNECT = 'connect',
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
  private reconnectAttempts = 0;
  private maxReconnectAttempts = ENV.SOCKET.RECONNECTION_ATTEMPTS;

  /**
   * Update authentication token
   */
  updateAuth(token: string | null) {
    this.authToken = token;
    if (this.socket) {
      this.socket.auth = { token };
    }
  }

  /**
   * Connect to socket server
   */
  connect() {
    if (this.socket?.connected) {
      return;
    }

    if (!ENV.FEATURES.REAL_TIME) {
      console.log('[Socket] Real-time features disabled');
      return;
    }

    // Disconnect existing connection if any
    this.disconnect();

    // Create new socket connection
    this.socket = io(ENV.SOCKET.URL, {
      path: ENV.SOCKET.PATH,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: ENV.SOCKET.RECONNECTION_DELAY,
      auth: this.authToken ? { token: this.authToken } : undefined,
    });

    // Connection event handlers
    this.socket.on(SocketEvent.CONNECT, () => {
      console.log('[Socket] Connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on(SocketEvent.DISCONNECT, (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error);
      this.reconnectAttempts++;
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('[Socket] Max reconnection attempts reached');
      }
    });
  }

  /**
   * Disconnect from socket server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Emit an event to the server
   */
  emit(event: string, data?: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('[Socket] Cannot emit: socket not connected');
    }
  }

  /**
   * Listen to an event from the server
   */
  on<T = any>(event: string, callback: (data: T) => void): () => void {
    if (this.socket) {
      this.socket.on(event, callback);
      // Return unsubscribe function
      return () => {
        if (this.socket) {
          this.socket.off(event, callback);
        }
      };
    }
    // Return no-op function if socket not available
    return () => {};
  }

  /**
   * Remove event listener
   */
  off(event: string, callback?: (...args: any[]) => void) {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.removeAllListeners(event);
      }
    }
  }
}

// Export singleton instance
export const socketService = new SocketService();
