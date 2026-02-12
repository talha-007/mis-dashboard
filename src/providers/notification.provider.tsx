/**
 * Notification Provider
 * Provides socket notifications to the app
 * Shows toast notifications for new notifications
 */

import { ReactNode } from 'react';

import { useNotifications } from 'src/hooks';
import { NotificationContainer } from 'src/components/notifications';

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  // Initialize notification listeners
  useNotifications();

  return (
    <>
      {/* Toast Notifications Container */}
      <NotificationContainer maxVisible={3} />

      {/* App Content */}
      {children}
    </>
  );
};
