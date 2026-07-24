import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

const BACKEND_URL = (import.meta as any).env?.VITE_API_URL
  ? (import.meta as any).env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:3000';

export function connectSocket(role?: string): Socket {
  if (socket?.connected) return socket;

  const token = localStorage.getItem('eveng_admin_token') || sessionStorage.getItem('eveng_token');

  socket = io(BACKEND_URL, {
    transports: ['websocket', 'polling'],
    reconnectionDelay: 5000,
    reconnectionAttempts: 5,
    query: {
      role: role || 'Admin',
      token: token || ''
    }
  });

  socket.on('connect', () => {
  });

  socket.on('disconnect', () => {
  });

  socket.on('connect_error', () => {
  });

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}

export function getSocket(): Socket | null {
  return socket;
}
