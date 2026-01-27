/**
 * useNotifications Hook
 * Custom hook for managing notifications
 */

import { useCallback } from 'react';

import { useAppDispatch, useAppSelector } from 'src/store';
import {
  markAsRead,
  markAllAsRead,
  removeNotification,
  clearNotifications,
} from 'src/store/slices/notifications.slice';

export const useNotifications = () => {
  const dispatch = useAppDispatch();
  const { items, unreadCount, isLoading } = useAppSelector((state) => state.notifications);

  const markRead = useCallback(
    (notificationId: string) => {
      dispatch(markAsRead(notificationId));
    },
    [dispatch]
  );

  const markAllRead = useCallback(() => {
    dispatch(markAllAsRead());
  }, [dispatch]);

  const removeNotif = useCallback(
    (notificationId: string) => {
      dispatch(removeNotification(notificationId));
    },
    [dispatch]
  );

  const clearAll = useCallback(() => {
    dispatch(clearNotifications());
  }, [dispatch]);

  return {
    // State
    notifications: items,
    unreadCount,
    isLoading,
    
    // Actions
    markAsRead: markRead,
    markAllAsRead: markAllRead,
    removeNotification: removeNotif,
    clearNotifications: clearAll,
  };
};
