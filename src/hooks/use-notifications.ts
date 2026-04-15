/**
 * useNotifications Hook
 * Custom hook for managing Socket.io notifications via centralized socketService
 * ⚠️ Do NOT create new Socket.io connections - use the centralized one!
 */

import type { Notification, SocketNotification } from 'src/types/notification';

import { useState, useEffect, useCallback } from 'react';

import { useSocket } from 'src/hooks/useSocket';

import { devLog } from 'src/utils/logger';

export const useNotifications = () => {
  const { on } = useSocket();
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
      prev.map((notif) => (notif.id === notificationId ? { ...notif, isRead: true } : notif))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
    setUnreadCount(0);
  }, []);

  // Clear notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Delete single notification
  const deleteNotification = useCallback((notificationId: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== notificationId));
  }, []);

  // Listen for WebSocket events via centralized socketService
  useEffect(() => {
    // User events
    const unsubUserLogin = on<SocketNotification>('user_login', (data: SocketNotification) => {
      devLog('📢 User login:', data);
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

    const unsubUserRegistered = on<SocketNotification>(
      'user_registered',
      (data: SocketNotification) => {
        devLog('📢 User registered:', data);
        addNotification({
          ...data,
          id: data.notificationId || data.id || Date.now().toString(),
          type: 'success',
          title: data.title || 'Registration Successful',
          message: data.message || 'Your account has been created successfully',
          timestamp: data.timestamp?.toString() || new Date().toISOString(),
        });
      }
    );

    // Bank events
    const unsubBank = on<SocketNotification>('bank_status_changed', (data: SocketNotification) => {
      devLog('📢 Bank status changed:', data);
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

    const unsubSubscriptionStatus = on<SocketNotification>(
      'subscription_status_changed',
      (data: SocketNotification) => {
        devLog('📢 Subscription status changed:', data);
        addNotification({
          ...data,
          id: data.notificationId || data.id || Date.now().toString(),
          type: 'info',
          title: data.title || 'Subscription Status Changed',
          message: data.message || 'Your subscription plan status has been updated',
          timestamp: data.timestamp?.toString() || new Date().toISOString(),
        });
      }
    );

    // Loan events
    const unsubLoanApproved = on<SocketNotification>(
      'loan_approved',
      (data: SocketNotification) => {
        devLog('📢 Loan approved:', data);
        addNotification({
          ...data,
          id: data.notificationId || data.id || Date.now().toString(),
          type: 'success',
          title: data.title || 'Loan Application Approved',
          message: data.message || 'Congratulations! Your loan application has been approved',
          timestamp: data.timestamp?.toString() || new Date().toISOString(),
        });
      }
    );

    const unsubLoanRejected = on<SocketNotification>(
      'loan_rejected',
      (data: SocketNotification) => {
        devLog('📢 Loan rejected:', data);
        addNotification({
          ...data,
          id: data.notificationId || data.id || Date.now().toString(),
          type: 'warning',
          title: data.title || 'Loan Application Rejected',
          message: data.message || 'Your loan application has been rejected',
          timestamp: data.timestamp?.toString() || new Date().toISOString(),
        });
      }
    );

    const unsubNewLoanApplication = on<SocketNotification>(
      'new_loan_application',
      (data: SocketNotification) => {
        devLog('📢 New loan application:', data);
        addNotification({
          ...data,
          id: data.notificationId || data.id || Date.now().toString(),
          type: 'info',
          title: data.title || 'New Loan Application',
          message: data.message || 'A customer has submitted a new loan application',
          timestamp: data.timestamp?.toString() || new Date().toISOString(),
        });
      }
    );

    // Assessment events
    const unsubAssessmentScoreGenerated = on<SocketNotification>(
      'assessment_score_generated',
      (data: SocketNotification) => {
        devLog('📢 Assessment score generated:', data);
        addNotification({
          ...data,
          id: data.notificationId || data.id || Date.now().toString(),
          type: 'info',
          title: data.title || 'Assessment Score Generated',
          message: data.message || 'Your assessment has been scored. Check your credit score!',
          timestamp: data.timestamp?.toString() || new Date().toISOString(),
        });
      }
    );

    const unsubAssessmentSubmitted = on<SocketNotification>(
      'assessment_submitted',
      (data: SocketNotification) => {
        devLog('📢 Assessment submitted:', data);
        addNotification({
          ...data,
          id: data.notificationId || data.id || Date.now().toString(),
          type: 'info',
          title: data.title || 'New Assessment Submitted',
          message: data.message || 'A customer has submitted a new assessment',
          timestamp: data.timestamp?.toString() || new Date().toISOString(),
        });
      }
    );

    const unsubNewCustomerRegistered = on<SocketNotification>(
      'new_customer_registered',
      (data: SocketNotification) => {
        devLog('📢 New customer registered:', data);
        addNotification({
          ...data,
          id: data.notificationId || data.id || Date.now().toString(),
          type: 'info',
          title: data.title || 'New Customer Registered',
          message: data.message || 'A new customer has registered under your bank',
          timestamp: data.timestamp?.toString() || new Date().toISOString(),
        });
      }
    );

    // Payment events
    const unsubPaymentSuccess = on<SocketNotification>(
      'payment_success',
      (data: SocketNotification) => {
        devLog('📢 Payment successful:', data);
        addNotification({
          ...data,
          id: data.notificationId || data.id || Date.now().toString(),
          type: 'success',
          timestamp: data.timestamp?.toString() || new Date().toISOString(),
        });
      }
    );

    const unsubPaymentFailed = on<SocketNotification>(
      'payment_failed',
      (data: SocketNotification) => {
        devLog('📢 Payment failed:', data);
        addNotification({
          ...data,
          id: data.notificationId || data.id || Date.now().toString(),
          type: 'error',
          timestamp: data.timestamp?.toString() || new Date().toISOString(),
        });
      }
    );

    const unsubPaymentOverdue = on<SocketNotification>(
      'payment_overdue',
      (data: SocketNotification) => {
        devLog('📢 Payment overdue:', data);
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
        devLog('📢 Payment reminder:', data);
        addNotification({
          ...data,
          id: data.notificationId || data.id || Date.now().toString(),
          type: 'info',
          timestamp: data.timestamp?.toString() || new Date().toISOString(),
        });
      }
    );

    const unsubPaymentReceipt = on<SocketNotification>(
      'payment_receipt',
      (data: SocketNotification) => {
        devLog('📢 Payment receipt:', data);
        addNotification({
          ...data,
          id: data.notificationId || data.id || Date.now().toString(),
          type: 'success',
          title: data.title || 'Payment Received',
          message: data.message || 'Your installment payment was successful',
          timestamp: data.timestamp?.toString() || new Date().toISOString(),
        });
      }
    );

    const unsubInstallmentOverdue = on<SocketNotification>(
      'installment_overdue',
      (data: SocketNotification) => {
        devLog('📢 Installment overdue:', data);
        addNotification({
          ...data,
          id: data.notificationId || data.id || Date.now().toString(),
          type: 'warning',
          title: data.title || 'Installment Overdue',
          message: data.message || 'An installment is past its due date',
          timestamp: data.timestamp?.toString() || new Date().toISOString(),
        });
      }
    );

    const unsubInstallmentPaid = on<SocketNotification>(
      'installment_paid',
      (data: SocketNotification) => {
        devLog('📢 Installment paid:', data);
        addNotification({
          ...data,
          id: data.notificationId || data.id || Date.now().toString(),
          type: 'success',
          title: data.title || 'Installment Paid',
          message: data.message || 'A customer has paid an installment',
          timestamp: data.timestamp?.toString() || new Date().toISOString(),
        });
      }
    );

    const unsubAccountDefaulted = on<SocketNotification>(
      'account_defaulted',
      (data: SocketNotification) => {
        devLog('📢 Account defaulted:', data);
        addNotification({
          ...data,
          id: data.notificationId || data.id || Date.now().toString(),
          type: 'error',
          title: data.title || 'Account Defaulted',
          message: data.message || 'Your account has been marked as defaulter',
          timestamp: data.timestamp?.toString() || new Date().toISOString(),
        });
      }
    );

    const unsubRecoveryCaseUpdate = on<SocketNotification>(
      'recovery_case_update',
      (data: SocketNotification) => {
        devLog('📢 Recovery case update:', data);
        addNotification({
          ...data,
          id: data.notificationId || data.id || Date.now().toString(),
          type: 'info',
          title: data.title || 'Recovery Case Updated',
          message: data.message || 'A recovery officer has updated a case',
          timestamp: data.timestamp?.toString() || new Date().toISOString(),
        });
      }
    );

    const unsubEmployeeCreated = on<SocketNotification>(
      'employee_created',
      (data: SocketNotification) => {
        devLog('📢 Employee created:', data);
        addNotification({
          ...data,
          id: data.notificationId || data.id || Date.now().toString(),
          type: 'success',
          title: data.title || 'Account Created',
          message: data.message || 'Your recovery officer account has been created',
          timestamp: data.timestamp?.toString() || new Date().toISOString(),
        });
      }
    );

    const unsubRecoveryCaseAssigned = on<SocketNotification>(
      'recovery_case_assigned',
      (data: SocketNotification) => {
        devLog('📢 Recovery case assigned:', data);
        addNotification({
          ...data,
          id: data.notificationId || data.id || Date.now().toString(),
          type: 'info',
          title: data.title || 'Recovery Case Assigned',
          message: data.message || 'A recovery case has been assigned to you',
          timestamp: data.timestamp?.toString() || new Date().toISOString(),
        });
      }
    );

    // Cleanup on unmount
    return () => {
      unsubUserLogin();
      unsubUserRegistered();
      unsubBank();
      unsubSubscriptionStatus();
      unsubLoanApproved();
      unsubLoanRejected();
      unsubNewLoanApplication();
      unsubAssessmentScoreGenerated();
      unsubAssessmentSubmitted();
      unsubNewCustomerRegistered();
      unsubPaymentSuccess();
      unsubPaymentFailed();
      unsubPaymentOverdue();
      unsubPaymentReminder();
      unsubPaymentReceipt();
      unsubInstallmentOverdue();
      unsubInstallmentPaid();
      unsubAccountDefaulted();
      unsubRecoveryCaseUpdate();
      unsubEmployeeCreated();
      unsubRecoveryCaseAssigned();
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
