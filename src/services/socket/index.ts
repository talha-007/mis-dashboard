/**
 * Re-export from redux/services for backward compatibility.
 * Prefer: import from 'src/redux/services/socket'
 */
export {
  SocketEvent,
  socketService,
  type StatsUpdatePayload,
  type NotificationPayload,
} from 'src/redux/services/socket';
