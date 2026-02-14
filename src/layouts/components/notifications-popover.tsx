import type { Notification } from 'src/types/notification';
import type { IconButtonProps } from '@mui/material/IconButton';

import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';

import { fToNow } from 'src/utils/format-time';

import { useNotifications } from 'src/hooks';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

/**
 * Map Socket.io notification type to UI type
 */
function getNotificationType(socketType: string): string {
  const typeMap: Record<string, string> = {
    status_change: 'bank-status',
    loan_approved: 'loan',
    loan_rejected: 'loan',
    payment_success: 'payment',
    payment_failed: 'payment',
    payment_overdue: 'payment',
    payment_reminder: 'payment',
  };
  return typeMap[socketType] || 'mail';
}

/**
 * Get avatar icon for notification type
 */
function getAvatarForType(notificationType: string): string | null {
  // Return null to use default emoji/icon rendering
  // The renderContent function will handle the actual icon
  return null;
}

// ----------------------------------------------------------------------

type NotificationItemProps = {
  id: string;
  type: string;
  title: string;
  isUnRead: boolean;
  description: string;
  avatarUrl: string | null;
  postedAt: string | number | null;
};

export type NotificationsPopoverProps = IconButtonProps & {
  data?: NotificationItemProps[];
};

export function NotificationsPopover({ data = [], sx, ...other }: NotificationsPopoverProps) {
  const { notifications: socketNotifications, markAllAsRead, markAsRead } = useNotifications();

  // Map Socket.io notifications to UI format
  const mappedNotifications = useMemo(
    () =>
      socketNotifications.map((notif: Notification) => ({
        id: notif.id,
        type: getNotificationType(notif.type),
        title: notif.title,
        isUnRead: !notif.isRead,
        description: notif.message,
        avatarUrl: getAvatarForType(notif.type),
        postedAt: new Date(notif.timestamp).getTime(),
      })),
    [socketNotifications]
  );

  // Fallback to initial data if no socket notifications
  const [notificationsState, setNotificationsState] = useState<NotificationItemProps[]>(
    mappedNotifications.length > 0 ? mappedNotifications : data
  );

  // Update state when socket notifications change
  useEffect(() => {
    if (mappedNotifications.length > 0) {
      setNotificationsState(mappedNotifications);
    }
  }, [mappedNotifications]);

  const totalUnRead = notificationsState.filter((item) => item.isUnRead === true).length;

  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const handleMarkAllAsRead = useCallback(() => {
    // Mark all as read in Socket.io notifications
    markAllAsRead();

    // Also update local state
    const updatedNotifications = notificationsState.map((notification) => ({
      ...notification,
      isUnRead: false,
    }));
    setNotificationsState(updatedNotifications);
  }, [notificationsState, markAllAsRead]);

  const handleNotificationClick = useCallback(
    (notificationId: string) => {
      markAsRead(notificationId);
      const updatedNotifications = notificationsState.map((notification) =>
        notification.id === notificationId ? { ...notification, isUnRead: false } : notification
      );
      setNotificationsState(updatedNotifications);
    },
    [notificationsState, markAsRead]
  );

  return (
    <>
      <IconButton
        color={openPopover ? 'primary' : 'default'}
        onClick={handleOpenPopover}
        sx={sx}
        {...other}
      >
        <Badge badgeContent={totalUnRead} color="error">
          <Iconify width={24} icon="solar:bell-bing-bold-duotone" />
        </Badge>
      </IconButton>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              width: 360,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            },
          },
        }}
      >
        <Box
          sx={{
            py: 2,
            pl: 2.5,
            pr: 1.5,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1">Notifications</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              You have {totalUnRead} unread messages
            </Typography>
          </Box>

          {totalUnRead > 0 && (
            <Tooltip title="Mark all as read">
              <IconButton color="primary" onClick={handleMarkAllAsRead}>
                <Iconify icon="eva:done-all-fill" />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Scrollbar fillContent sx={{ minHeight: 240, maxHeight: { xs: 360, sm: 'none' } }}>
          {notificationsState.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                No notifications yet
              </Typography>
            </Box>
          ) : (
            <>
              <List
                disablePadding
                subheader={
                  <ListSubheader disableSticky sx={{ py: 1, px: 2.5, typography: 'overline' }}>
                    New
                  </ListSubheader>
                }
              >
                {notificationsState.slice(0, 2).map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClick={() => handleNotificationClick(notification.id)}
                  />
                ))}
              </List>

              {notificationsState.length > 2 && (
                <List
                  disablePadding
                  subheader={
                    <ListSubheader disableSticky sx={{ py: 1, px: 2.5, typography: 'overline' }}>
                      Before that
                    </ListSubheader>
                  }
                >
                  {notificationsState.slice(2, 5).map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onClick={() => handleNotificationClick(notification.id)}
                    />
                  ))}
                </List>
              )}
            </>
          )}
        </Scrollbar>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Box sx={{ p: 1 }}>
          <Button fullWidth disableRipple color="inherit">
            View all
          </Button>
        </Box>
      </Popover>
    </>
  );
}

// ----------------------------------------------------------------------

function NotificationItem({
  notification,
  onClick,
}: {
  notification: NotificationItemProps;
  onClick?: () => void;
}) {
  const { avatarUrl, title } = renderContent(notification);

  return (
    <ListItemButton
      onClick={onClick}
      sx={{
        py: 1.5,
        px: 2.5,
        mt: '1px',
        ...(notification.isUnRead && {
          bgcolor: 'action.selected',
        }),
      }}
    >
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: 'background.neutral' }}>{avatarUrl}</Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={title}
        secondary={
          <Typography
            variant="caption"
            sx={{
              mt: 0.5,
              gap: 0.5,
              display: 'flex',
              alignItems: 'center',
              color: 'text.disabled',
            }}
          >
            <Iconify width={14} icon="solar:clock-circle-outline" />
            {fToNow(notification.postedAt)}
          </Typography>
        }
      />
    </ListItemButton>
  );
}

/**
 * Map Socket.io notification type to UI type
 */
function renderContent(notification: NotificationItemProps) {
  const title = (
    <Typography variant="subtitle2">
      {notification.title}
      <Typography component="span" variant="body2" sx={{ color: 'text.secondary' }}>
        &nbsp; {notification.description}
      </Typography>
    </Typography>
  );

  if (notification.type === 'order-placed') {
    return {
      avatarUrl: (
        <img
          alt={notification.title}
          src="/assets/icons/notification/ic-notification-package.svg"
        />
      ),
      title,
    };
  }
  if (notification.type === 'order-shipped') {
    return {
      avatarUrl: (
        <img
          alt={notification.title}
          src="/assets/icons/notification/ic-notification-shipping.svg"
        />
      ),
      title,
    };
  }
  if (notification.type === 'mail') {
    return {
      avatarUrl: (
        <img alt={notification.title} src="/assets/icons/notification/ic-notification-mail.svg" />
      ),
      title,
    };
  }
  if (notification.type === 'chat-message') {
    return {
      avatarUrl: (
        <img alt={notification.title} src="/assets/icons/notification/ic-notification-chat.svg" />
      ),
      title,
    };
  }
  if (notification.type === 'bank-status') {
    return {
      avatarUrl: (
        <img alt={notification.title} src="/assets/icons/notification/ic-notification-bank.svg" />
      ),
      title,
    };
  }
  if (notification.type === 'payment') {
    return {
      avatarUrl: (
        <img
          alt={notification.title}
          src="/assets/icons/notification/ic-notification-payment.svg"
        />
      ),
      title,
    };
  }
  if (notification.type === 'loan') {
    return {
      avatarUrl: (
        <img alt={notification.title} src="/assets/icons/notification/ic-notification-loan.svg" />
      ),
      title,
    };
  }
  return {
    avatarUrl: notification.avatarUrl ? (
      <img alt={notification.title} src={notification.avatarUrl} />
    ) : null,
    title,
  };
}
