/**
 * Socket.io Service
 * Manages WebSocket connections and real-time communication
 */

import type { Socket } from 'socket.io-client';

import { io } from 'socket.io-client';

import { getAuthToken } from 'src/utils/auth-storage';

import ENV from 'src/config/environment';

import { SocketEvent } from './types';

import type { SocketConfig, SocketEventHandler } from './types';

class SocketService {
  private socket: Socket | null = null;
  private subscriptions: Map<string, Set<SocketEventHandler>> = new Map();
  private isConnecting: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number;

  constructor(private config: SocketConfig) {
    this.maxReconnectAttempts = config.reconnectionAttempts;
  }

  /**
   * Initialize and connect to socket server
   */
  connect(): void {
    if (this.socket?.connected || this.isConnecting) {
      console.warn('[Socket] Already connected or connecting');
      return;
    }

    this.isConnecting = true;
    const token = getAuthToken();

    this.socket = io(this.config.url, {
      path: this.config.path,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.config.reconnectionAttempts,
      reconnectionDelay: this.config.reconnectionDelay,
      auth: {
        token,
      },
    });

    this.setupEventListeners();
  }

  /**
   * Disconnect from socket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnecting = false;
      console.log('[Socket] Disconnected');
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Emit event to server
   */
  emit<T = any>(event: string, data?: T): void {
    if (!this.socket?.connected) {
      console.warn('[Socket] Not connected. Cannot emit event:', event);
      return;
    }

    this.socket.emit(event, data);

    if (ENV.IS_DEV) {
      console.log(`[Socket] Emitted event: ${event}`, data);
    }
  }

  /**
   * Subscribe to socket event
   */
  on<T = any>(event: string, handler: SocketEventHandler<T>): () => void {
    if (!this.subscriptions.has(event)) {
      this.subscriptions.set(event, new Set());
    }

    const handlers = this.subscriptions.get(event)!;
    handlers.add(handler as SocketEventHandler);

    // If socket is already connected, register the listener
    if (this.socket) {
      this.socket.on(event, handler);
    }

    // Return unsubscribe function
    return () => this.off(event, handler);
  }

  /**
   * Unsubscribe from socket event
   */
  off<T = any>(event: string, handler?: SocketEventHandler<T>): void {
    if (handler) {
      const handlers = this.subscriptions.get(event);
      if (handlers) {
        handlers.delete(handler as SocketEventHandler);
        if (handlers.size === 0) {
          this.subscriptions.delete(event);
        }
      }

      if (this.socket) {
        this.socket.off(event, handler);
      }
    } else {
      // Remove all handlers for this event
      this.subscriptions.delete(event);
      if (this.socket) {
        this.socket.off(event);
      }
    }
  }

  /**
   * Subscribe to event once (auto-unsubscribe after first emit)
   */
  once<T = any>(event: string, handler: SocketEventHandler<T>): void {
    const wrappedHandler = (data: T) => {
      handler(data);
      this.off(event, wrappedHandler);
    };

    this.on(event, wrappedHandler);
  }

  /**
   * Setup core event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    // Connection established
    this.socket.on(SocketEvent.CONNECT, () => {
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      console.log('[Socket] Connected to server');
    });

    // Connection error
    this.socket.on(SocketEvent.CONNECT_ERROR, (error: Error) => {
      this.isConnecting = false;
      console.error('[Socket] Connection error:', error);
    });

    // Disconnected
    this.socket.on(SocketEvent.DISCONNECT, (reason: string) => {
      console.log('[Socket] Disconnected:', reason);
    });

    // Reconnection attempt
    this.socket.on(SocketEvent.RECONNECT_ATTEMPT, (attempt: number) => {
      this.reconnectAttempts = attempt;
      console.log(`[Socket] Reconnection attempt ${attempt}/${this.maxReconnectAttempts}`);
    });

    // Reconnection error
    this.socket.on(SocketEvent.RECONNECT_ERROR, (error: Error) => {
      console.error('[Socket] Reconnection error:', error);
    });

    // Reconnection failed
    this.socket.on(SocketEvent.RECONNECT_FAILED, () => {
      console.error('[Socket] Reconnection failed after maximum attempts');
    });

    // Successfully reconnected
    this.socket.on(SocketEvent.RECONNECT, (attempt: number) => {
      console.log(`[Socket] Reconnected after ${attempt} attempts`);
    });

    // Authenticated
    this.socket.on(SocketEvent.AUTHENTICATED, () => {
      console.log('[Socket] Authenticated successfully');
    });

    // Unauthorized
    this.socket.on(SocketEvent.UNAUTHORIZED, (error: any) => {
      console.error('[Socket] Authentication failed:', error);
      this.disconnect();
    });

    // Re-register all subscribed events
    this.subscriptions.forEach((handlers, event) => {
      handlers.forEach((handler) => {
        this.socket?.on(event, handler);
      });
    });
  }

  /**
   * Update authentication token and reconnect
   */
  updateAuth(token: string): void {
    if (this.socket) {
      this.socket.auth = { token };
      this.socket.disconnect();
      this.socket.connect();
    }
  }

  /**
   * Get socket instance (use with caution)
   */
  getSocket(): Socket | null {
    return this.socket;
  }
}

// Create singleton instance
const socketConfig: SocketConfig = {
  url: ENV.SOCKET.URL,
  path: ENV.SOCKET.PATH,
  reconnectionAttempts: ENV.SOCKET.RECONNECTION_ATTEMPTS,
  reconnectionDelay: ENV.SOCKET.RECONNECTION_DELAY,
};

export const socketService = new SocketService(socketConfig);
