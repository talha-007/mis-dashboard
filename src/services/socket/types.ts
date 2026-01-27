/**
 * Socket.io Types and Interfaces
 */

export interface SocketConfig {
  url: string;
  path: string;
  reconnectionAttempts: number;
  reconnectionDelay: number;
}

export enum SocketEvent {
  // Connection Events
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  CONNECT_ERROR = 'connect_error',
  RECONNECT = 'reconnect',
  RECONNECT_ATTEMPT = 'reconnect_attempt',
  RECONNECT_ERROR = 'reconnect_error',
  RECONNECT_FAILED = 'reconnect_failed',

  // Authentication Events
  AUTHENTICATE = 'authenticate',
  AUTHENTICATED = 'authenticated',
  UNAUTHORIZED = 'unauthorized',

  // Notification Events
  NOTIFICATION = 'notification',
  NOTIFICATION_READ = 'notification:read',
  NOTIFICATION_DELETE = 'notification:delete',

  // Stats Events
  STATS_UPDATE = 'stats:update',
  ANALYTICS_UPDATE = 'analytics:update',

  // User Events
  USER_ONLINE = 'user:online',
  USER_OFFLINE = 'user:offline',
  USER_STATUS_CHANGE = 'user:status:change',

  // System Events
  SYSTEM_MESSAGE = 'system:message',
  SYSTEM_ALERT = 'system:alert',
  MAINTENANCE = 'system:maintenance',
}

export interface SocketMessage<T = any> {
  type: string;
  payload: T;
  timestamp: number;
}

export interface NotificationPayload {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  data?: Record<string, any>;
}

export interface StatsUpdatePayload {
  metric: string;
  value: number;
  change?: number;
  changePercentage?: number;
  timestamp: string;
}

export interface UserStatusPayload {
  userId: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  lastSeen?: string;
}

export type SocketEventHandler<T = any> = (data: T) => void;

export interface SocketSubscription {
  event: string;
  handler: SocketEventHandler;
}
