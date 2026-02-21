import { callAPi } from './http-common';

/**
 * Notifications Service
 * Handles API calls for user notifications. Requires Bank Token.
 * Endpoints: /api/v1/notifications/*
 */

const getAll = (userId: string, params?: any) =>
  callAPi.get(`/api/v1/notifications/user/${userId}`, { params });

const getUnreadCount = (userId: string) =>
  callAPi.get(`/api/v1/notifications/user/${userId}/unread-count`);

const getById = (notificationId: string) =>
  callAPi.get(`/api/v1/notifications/${notificationId}`);

const markAsRead = (notificationId: string) =>
  callAPi.put(`/api/v1/notifications/${notificationId}/read`);

const markAllAsRead = (userId: string) =>
  callAPi.put(`/api/v1/notifications/user/${userId}/read-all`);

const deleteById = (notificationId: string) =>
  callAPi.delete(`/api/v1/notifications/${notificationId}`);

const deleteAll = (userId: string) =>
  callAPi.delete(`/api/v1/notifications/user/${userId}/delete-all`);

const notificationsService = {
  getAll,
  getUnreadCount,
  getById,
  markAsRead,
  markAllAsRead,
  deleteById,
  deleteAll,
};

export default notificationsService;
