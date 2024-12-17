import { io, Socket } from "socket.io-client";

declare global {
  interface Window {
    socket: Socket;
    roomId: number;
  }
}

// Initialize socket with auth handling
const socket = io({
  auth: {
    token: document.cookie.split('; ')
      .find(row => row.startsWith('connect.sid='))
      ?.split('=')[1]
  },
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Handle connection events
socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error.message);
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});

window.socket = socket;
