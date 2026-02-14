import './notifications.css';

import type { Notification } from 'src/types/notification';

import { useState, useEffect } from 'react';

interface NotificationToastProps {
  notification: Notification;
  onClose: () => void;
  autoClose?: number;
}

const getIcon = (notification: Notification): string => {
  switch (notification.type) {
    case 'status_change':
      return notification.data?.newStatus === 'active' ? '✓' : '⚠️';
    case 'warning':
      return '⚠️';
    case 'error':
      return '❌';
    case 'success':
      return '✓';
    case 'info':
    default:
      return 'ℹ️';
  }
};

const getColorClass = (notification: Notification): string => {
  switch (notification.type) {
    case 'status_change':
      return notification.data?.newStatus === 'active'
        ? 'notification-success'
        : 'notification-warning';
    case 'warning':
      return 'notification-warning';
    case 'error':
      return 'notification-danger';
    case 'success':
      return 'notification-success';
    case 'info':
    default:
      return 'notification-info';
  }
};

export const NotificationToast = ({
  notification,
  onClose,
  autoClose = 5000,
}: NotificationToastProps) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsClosing(true);
      setTimeout(onClose, 300);
    }, autoClose);

    return () => clearTimeout(timer);
  }, [autoClose, onClose]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className={`notification-toast ${getColorClass(notification)} ${isClosing ? 'notification-closing' : ''}`}
    >
      <div className="notification-toast-content">
        <div className="notification-toast-header">
          <span className="notification-toast-icon">{getIcon(notification)}</span>
          <h3 className="notification-toast-title">{notification.title}</h3>
          <button
            type="button"
            className="notification-toast-close"
            onClick={handleClose}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
        <div className="notification-toast-body">
          <p className="notification-toast-message">{notification.message}</p>
          {notification.data && Object.keys(notification.data).length > 0 && (
            <div className="notification-toast-details">
              {Object.entries(notification.data)
                .slice(0, 3)
                .map(([key, value]) => (
                  <p key={key} className="notification-toast-detail">
                    <strong>{key}:</strong> {String(value)}
                  </p>
                ))}
            </div>
          )}
        </div>
        <div className="notification-toast-footer">
          <small>{new Date(notification.timestamp).toLocaleTimeString()}</small>
        </div>
      </div>
    </div>
  );
};
