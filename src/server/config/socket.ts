import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { verify } from 'jsonwebtoken';
import { UserModel } from '../models/user';

export const configureSocketIO = (server: HttpServer) => {
  const io = new SocketServer(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production'
        ? process.env.CORS_ORIGIN
        : 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Global middleware for authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        next(new Error('Authentication required'));
        return;
      }

      const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string };
      const user = await UserModel.findById(decoded.userId);
      
      if (!user) {
        next(new Error('User not found'));
        return;
      }

      // Attach user data to socket
      socket.data.user = {
        id: user.id,
        username: user.username,
        email: user.email
        // Add any other properties needed
      };

      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  // Set up game handlers
  setupGameHandlers(io);

  // Error handling
  io.on('error', (error) => {
    console.error('Socket.IO error:', error);
  });

  return io;
}; 

function setupGameHandlers(io: SocketServer<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>) {
    throw new Error('Function not implemented.');
}
