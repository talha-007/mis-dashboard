/**
 * Notification Types and Interfaces
 */

export type NotificationType = 'status_change' | 'warning' | 'info' | 'error' | 'success';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  data?: Record<string, any>;
}

export interface SocketNotification extends Notification {
  bankId?: string;
  bankName?: string;
  oldStatus?: string;
  newStatus?: string;
  notificationId?: string;
}
