import './notifications.css';

import { useMemo } from 'react';

import { useNotifications } from 'src/hooks';

import { NotificationToast } from './notification-toast';

interface NotificationContainerProps {
  maxVisible?: number;
}

export const NotificationContainer = ({ maxVisible = 3 }: NotificationContainerProps) => {
  const { notifications, deleteNotification } = useNotifications();

  // Only show most recent notifications (toast)
  const visibleNotifications = useMemo(() => notifications.slice(0, maxVisible), [notifications, maxVisible]);

  return (
    <div className="notification-container">
      {visibleNotifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onClose={() => deleteNotification(notification.id)}
        />
      ))}
    </div>
  );
};
