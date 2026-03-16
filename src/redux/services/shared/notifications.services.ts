import { callAPi } from '../http-common';

/**
 * Notifications Service (Shared - any authenticated user)
 * GET  /api/v1/notifications?page=1&limit=20&unreadOnly=true
 * PUT  /api/v1/notifications/:id/read
 * PUT  /api/v1/notifications/read-all
 */

const getNotifications = (params?: { page?: number; limit?: number; unreadOnly?: boolean }) =>
  callAPi.get('/api/v1/notifications', { params });

const markAsRead = (notificationId: string) =>
  callAPi.put(`/api/v1/notifications/${notificationId}/read`);

const markAllAsRead = () => callAPi.put('/api/v1/notifications/read-all');

const notificationsService = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};

export default notificationsService;
