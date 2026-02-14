import './notifications.css';

import { useNotifications } from 'src/hooks';

export const NotificationHistory = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } =
    useNotifications();

  if (notifications.length === 0) {
    return (
      <div className="notification-history-empty">
        <p>No notifications yet</p>
      </div>
    );
  }

  return (
    <div className="notification-history">
      <div className="notification-history-header">
        <h3>Notifications ({unreadCount} unread)</h3>
        <div className="notification-history-actions">
          {unreadCount > 0 && (
            <button
              type="button"
              className="btn-notification btn-sm btn-secondary"
              onClick={markAllAsRead}
            >
              Mark all as read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              type="button"
              className="btn-notification btn-sm btn-danger"
              onClick={clearNotifications}
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      <div className="notification-list">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`notification-item notification-item-${notification.type} ${
              !notification.isRead ? 'notification-item-unread' : ''
            }`}
            onClick={() => !notification.isRead && markAsRead(notification.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && !notification.isRead) {
                markAsRead(notification.id);
              }
            }}
          >
            <div>
              <div className="notification-item-header">
                <strong>{notification.title}</strong>
                <small>{new Date(notification.timestamp).toLocaleString()}</small>
              </div>
              <div className="notification-item-body">
                <p>{notification.message}</p>
                {notification.data && Object.keys(notification.data).length > 0 && (
                  <div className="notification-item-details">
                    {Object.entries(notification.data)
                      .slice(0, 2)
                      .map(([key, value]) => (
                        <span key={key} className="notification-item-detail">
                          {key}: {String(value)}
                        </span>
                      ))}
                  </div>
                )}
              </div>
            </div>
            <div className="notification-item-indicator">
              {!notification.isRead && <div className="unread-dot" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
