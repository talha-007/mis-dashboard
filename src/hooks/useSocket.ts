/**
 * useSocket Hook
 * Returns the existing Socket.io connection from SocketProvider
 * ⚠️ Do NOT create a new connection - use the centralized one!
 */

import { useSocket as useSocketContext } from 'src/providers/socket.provider';

export const useSocket = () => {
  // Use the centralized socket provider - this returns the shared socketService context
  const context = useSocketContext();

  return {
    isConnected: context.isConnected,
    emit: context.emit,
    on: context.on,
    off: context.off,
  };
};
