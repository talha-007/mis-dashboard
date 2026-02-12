/**
 * useNotifications Hook
 * Custom hook for managing Socket.io notifications via centralized socketService
 * ⚠️ Do NOT create new Socket.io connections - use the centralized one!
 */

import { useEffect, useState, useCallback } from 'react';

import { useSocket } from 'src/hooks/useSocket';
import type { Notification, SocketNotification } from 'src/types/notification';

export const useNotifications = () => {
  const { on, off } = useSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Add notification
  const addNotification = useCallback((notification: SocketNotification) => {
    const newNotification: Notification = {
      id: notification.notificationId || notification.id || Date.now().toString(),
      type: notification.type,
      title: notification.title,
      message: notification.message,
      timestamp: notification.timestamp || new Date().toISOString(),
      isRead: false,
      data: notification.data,
    };

    setNotifications((prev) => [newNotification, ...prev]);
    setUnreadCount((prev) => prev + 1);
  }, []);

  // Mark as read
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, isRead: true }))
    );
    setUnreadCount(0);
  }, []);

  // Clear notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Delete single notification
  const deleteNotification = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.filter((notif) => notif.id !== notificationId)
    );
  }, []);

  // Listen for WebSocket events via centralized socketService
  useEffect(() => {
    // User login event
    const unsubUserLogin = on<SocketNotification>('user_login', (data: SocketNotification) => {
      console.log('📢 User login:', data);
      addNotification({
        id: data.notificationId || data.id || Date.now().toString(),
        type: data.type || 'info',
        title: data.title || 'Welcome Back!',
        message: data.message || 'You have logged in successfully',
        timestamp: data.timestamp?.toString() || new Date().toISOString(),
        isRead: false,
        notificationId: data.notificationId,
        data: data.data,
      });
    });

    // Bank events
    const unsubBank = on<SocketNotification>('bank_status_changed', (data: SocketNotification) => {
      console.log('📢 Bank status changed:', data);
      addNotification({
        id: data.notificationId || data.id || Date.now().toString(),
        type: 'status_change',
        title: data.title || 'Bank Status Changed',
        message: data.message || 'Your bank status has been updated',
        timestamp: data.timestamp?.toString() || new Date().toISOString(),
        isRead: false,
        notificationId: data.notificationId,
        data: {
          ...data.data,
          bankId: data.bankId,
          bankName: data.bankName,
          oldStatus: data.oldStatus,
          newStatus: data.newStatus,
        },
      });
    });

    // Loan events
    const unsubLoanApproved = on<SocketNotification>('loan_approved', (data: SocketNotification) => {
      console.log('📢 Loan approved:', data);
      addNotification({
        ...data,
        id: data.notificationId || data.id || Date.now().toString(),
        type: 'success',
        timestamp: data.timestamp?.toString() || new Date().toISOString(),
      });
    });

    const unsubLoanRejected = on<SocketNotification>('loan_rejected', (data: SocketNotification) => {
      console.log('📢 Loan rejected:', data);
      addNotification({
        ...data,
        id: data.notificationId || data.id || Date.now().toString(),
        type: 'warning',
        timestamp: data.timestamp?.toString() || new Date().toISOString(),
      });
    });

    // Payment events
    const unsubPaymentSuccess = on<SocketNotification>(
      'payment_success',
      (data: SocketNotification) => {
        console.log('📢 Payment successful:', data);
        addNotification({
          ...data,
          id: data.notificationId || data.id || Date.now().toString(),
          type: 'success',
          timestamp: data.timestamp?.toString() || new Date().toISOString(),
        });
      }
    );

    const unsubPaymentFailed = on<SocketNotification>('payment_failed', (data: SocketNotification) => {
      console.log('📢 Payment failed:', data);
      addNotification({
        ...data,
        id: data.notificationId || data.id || Date.now().toString(),
        type: 'error',
        timestamp: data.timestamp?.toString() || new Date().toISOString(),
      });
    });

    const unsubPaymentOverdue = on<SocketNotification>(
      'payment_overdue',
      (data: SocketNotification) => {
        console.log('📢 Payment overdue:', data);
        addNotification({
          ...data,
          id: data.notificationId || data.id || Date.now().toString(),
          type: 'warning',
          timestamp: data.timestamp?.toString() || new Date().toISOString(),
        });
      }
    );

    const unsubPaymentReminder = on<SocketNotification>(
      'payment_reminder',
      (data: SocketNotification) => {
        console.log('📢 Payment reminder:', data);
        addNotification({
          ...data,
          id: data.notificationId || data.id || Date.now().toString(),
          type: 'info',
          timestamp: data.timestamp?.toString() || new Date().toISOString(),
        });
      }
    );

    // Cleanup on unmount
    return () => {
      unsubUserLogin();
      unsubBank();
      unsubLoanApproved();
      unsubLoanRejected();
      unsubPaymentSuccess();
      unsubPaymentFailed();
      unsubPaymentOverdue();
      unsubPaymentReminder();
    };
  }, [on, addNotification]);

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearNotifications,
  };
};
