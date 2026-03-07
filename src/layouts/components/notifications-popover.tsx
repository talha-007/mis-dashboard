import type { IconButtonProps } from '@mui/material/IconButton';

import { useState, useEffect, useCallback } from 'react';

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
import CircularProgress from '@mui/material/CircularProgress';

import { fToNow } from 'src/utils/format-time';

import notificationsService from 'src/redux/services/notifications.services';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

type NotifItem = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
};

function mapRaw(raw: any): NotifItem {
  return {
    id: String(raw._id ?? raw.id ?? ''),
    title: raw.title ?? '',
    message: raw.message ?? raw.body ?? '',
    type: raw.type ?? 'info',
    isRead: raw.isRead ?? raw.read ?? false,
    createdAt: raw.createdAt ?? raw.timestamp ?? new Date().toISOString(),
  };
}

function notifIcon(type: string) {
  const map: Record<string, string> = {
    loan_approved: 'solar:hand-money-bold-duotone',
    loan_rejected: 'solar:close-circle-bold-duotone',
    payment_success: 'solar:card-bold-duotone',
    payment_failed: 'solar:card-bold-duotone',
    payment_overdue: 'solar:bell-bing-bold-duotone',
    payment_reminder: 'solar:bell-bing-bold-duotone',
    bank_status: 'solar:bank-bold-duotone',
    status_change: 'solar:bank-bold-duotone',
    assessment_submitted: 'solar:clipboard-list-bold-duotone',
    assessment_score_generated: 'solar:star-bold-duotone',
    recovery: 'solar:wallet-money-bold-duotone',
    info: 'solar:info-circle-bold-duotone',
  };
  return map[type] ?? 'solar:bell-bold-duotone';
}

function notifColor(
  type: string
): 'primary' | 'success' | 'warning' | 'error' | 'info' | 'default' {
  if (type.includes('approved') || type.includes('success')) return 'success';
  if (type.includes('rejected') || type.includes('failed')) return 'error';
  if (type.includes('overdue') || type.includes('reminder') || type.includes('warning'))
    return 'warning';
  if (type.includes('bank') || type.includes('status')) return 'primary';
  return 'info';
}

// ----------------------------------------------------------------------

export type NotificationsPopoverProps = IconButtonProps;

export function NotificationsPopover({ sx, ...other }: NotificationsPopoverProps) {
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);
  const [notifications, setNotifications] = useState<NotifItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await notificationsService.getNotifications({ page: 1, limit: 20 });
      const raw = res.data?.data ?? res.data;
      const list = raw?.notifications ?? raw?.data ?? raw ?? [];
      setNotifications(Array.isArray(list) ? list.map(mapRaw) : []);
    } catch {
      // silently fail — keep previous list
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on first open
  const handleOpenPopover = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      setOpenPopover(event.currentTarget);
      fetchNotifications();
    },
    [fetchNotifications]
  );

  const handleClosePopover = useCallback(() => setOpenPopover(null), []);

  // Poll while popover is open (every 30 s)
  useEffect(() => {
    if (!openPopover) return () => {};
    const id = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(id);
  }, [openPopover, fetchNotifications]);

  const handleMarkAsRead = useCallback(
    async (notifId: string) => {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, isRead: true } : n))
      );
      try {
        await notificationsService.markAsRead(notifId);
      } catch {
        // Revert on failure
        setNotifications((prev) =>
          prev.map((n) => (n.id === notifId ? { ...n, isRead: false } : n))
        );
      }
    },
    []
  );

  const handleMarkAllAsRead = useCallback(async () => {
    setMarkingAll(true);
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await notificationsService.markAllAsRead();
    } catch {
      // Re-fetch to restore correct state
      await fetchNotifications();
    } finally {
      setMarkingAll(false);
    }
  }, [fetchNotifications]);

  const unread = notifications.filter((n) => !n.isRead);
  const read = notifications.filter((n) => n.isRead);

  return (
    <>
      <IconButton
        color={openPopover ? 'primary' : 'default'}
        onClick={handleOpenPopover}
        sx={sx}
        {...other}
      >
        <Badge badgeContent={unreadCount || undefined} color="error">
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
              width: 380,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            },
          },
        }}
      >
        {/* Header */}
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
            <Typography variant="body2" color="text.secondary">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
            </Typography>
          </Box>

          {unreadCount > 0 && (
            <Tooltip title="Mark all as read">
              <span>
                <IconButton color="primary" onClick={handleMarkAllAsRead} disabled={markingAll}>
                  {markingAll ? (
                    <CircularProgress size={18} />
                  ) : (
                    <Iconify icon="eva:done-all-fill" />
                  )}
                </IconButton>
              </span>
            </Tooltip>
          )}

          <Tooltip title="Refresh">
            <span>
              <IconButton onClick={fetchNotifications} disabled={loading}>
                {loading ? (
                  <CircularProgress size={18} />
                ) : (
                  <Iconify icon="solar:refresh-bold" />
                )}
              </IconButton>
            </span>
          </Tooltip>
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Scrollbar fillContent sx={{ minHeight: 240, maxHeight: 480 }}>
          {loading && notifications.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
              <CircularProgress size={28} />
            </Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Iconify
                icon="solar:bell-off-bold-duotone"
                width={40}
                sx={{ color: 'text.disabled', mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                No notifications
              </Typography>
            </Box>
          ) : (
            <>
              {unread.length > 0 && (
                <List
                  disablePadding
                  subheader={
                    <ListSubheader disableSticky sx={{ py: 1, px: 2.5, typography: 'overline' }}>
                      Unread
                    </ListSubheader>
                  }
                >
                  {unread.map((n) => (
                    <NotificationItem key={n.id} item={n} onMarkRead={handleMarkAsRead} />
                  ))}
                </List>
              )}

              {read.length > 0 && (
                <List
                  disablePadding
                  subheader={
                    <ListSubheader disableSticky sx={{ py: 1, px: 2.5, typography: 'overline' }}>
                      {unread.length > 0 ? 'Earlier' : 'Read'}
                    </ListSubheader>
                  }
                >
                  {read.map((n) => (
                    <NotificationItem key={n.id} item={n} onMarkRead={handleMarkAsRead} />
                  ))}
                </List>
              )}
            </>
          )}
        </Scrollbar>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Box sx={{ p: 1 }}>
          <Button fullWidth disableRipple color="inherit" onClick={fetchNotifications}>
            Refresh
          </Button>
        </Box>
      </Popover>
    </>
  );
}

// ----------------------------------------------------------------------

function NotificationItem({
  item,
  onMarkRead,
}: {
  item: NotifItem;
  onMarkRead: (id: string) => void;
}) {
  return (
    <ListItemButton
      onClick={() => !item.isRead && onMarkRead(item.id)}
      sx={{
        py: 1.5,
        px: 2.5,
        mt: '1px',
        ...(!item.isRead && { bgcolor: 'action.selected' }),
        cursor: item.isRead ? 'default' : 'pointer',
      }}
    >
      <ListItemAvatar>
        <Avatar
          sx={{
            bgcolor: `${notifColor(item.type)}.lighter`,
            color: `${notifColor(item.type)}.dark`,
          }}
        >
          <Iconify icon={notifIcon(item.type)} width={20} />
        </Avatar>
      </ListItemAvatar>

      <ListItemText
        primary={
          <Typography variant="subtitle2" sx={{ mb: 0.25 }}>
            {item.title}
            {!item.isRead && (
              <Box
                component="span"
                sx={{
                  ml: 1,
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: 'error.main',
                  display: 'inline-block',
                  verticalAlign: 'middle',
                }}
              />
            )}
          </Typography>
        }
        secondary={
          <Box component="span">
            <Typography
              component="span"
              variant="body2"
              color="text.secondary"
              sx={{ display: 'block', mb: 0.5 }}
            >
              {item.message}
            </Typography>
            <Typography
              component="span"
              variant="caption"
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.disabled' }}
            >
              <Iconify width={12} icon="solar:clock-circle-outline" />
              {fToNow(item.createdAt)}
            </Typography>
          </Box>
        }
      />
    </ListItemButton>
  );
}
