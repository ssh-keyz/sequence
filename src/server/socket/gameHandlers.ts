import { Server, Socket } from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace';
import { GameModel } from '../models/game';
import { verifyToken } from '../middleware/auth';
import {
  GameSocket,
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData
} from '../types/socket';

export const configureGameHandlers = (
  io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>
) => {
  // Authentication middleware
  io.use(async (socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const user = await verifyToken(token);
      if (!user) {
        return next(new Error('Invalid token'));
      }

      const gameSocket = socket as GameSocket;
      gameSocket.userId = user.id;
      gameSocket.gameRooms = new Map();
      next();
    } catch (err) {
      next(err instanceof Error ? err : new Error('Authentication failed'));
    }
  });

  // Connection handler
  io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) => {
    const gameSocket = socket as GameSocket;
    console.log(`User ${gameSocket.userId} connected`);

    gameSocket.on('joinGame', async (gameId: string) => {
      try {
        const gameState = await GameModel.getState(gameId);
        
        // Add socket to game room
        gameSocket.join(gameId);
        gameSocket.gameRooms.set(gameId, {
          id: gameId,
          players: gameState.players.map(p => p.id),
          spectators: [],
          gameState
        });

        // Notify other players
        gameSocket.to(gameId).emit('playerJoined', gameSocket.userId!);
        
        // Send initial game state
        io.to(gameId).emit('gameUpdate', gameState);
      } catch (err) {
        gameSocket.emit('gameError', err instanceof Error ? err.message : 'Failed to join game');
      }
    });

    gameSocket.on('leaveGame', (gameId: string) => {
      gameSocket.leave(gameId);
      gameSocket.gameRooms.delete(gameId);
      gameSocket.to(gameId).emit('playerLeft', gameSocket.userId!);
    });

    gameSocket.on('playCard', async (gameId: string, cardId: string, position: { x: number; y: number }) => {
      try {
        const [suit, value] = cardId.split('');
        const card = { suit, value };
        const gameState = await GameModel.makeMove(gameId, gameSocket.userId!, card, position);
        io.to(gameId).emit('gameUpdate', gameState);
      } catch (err) {
        gameSocket.emit('gameError', err instanceof Error ? err.message : 'Failed to play card');
      }
    });

    gameSocket.on('disconnect', () => {
      console.log(`User ${gameSocket.userId} disconnected`);
      // Clean up game rooms
      gameSocket.gameRooms.forEach((room, gameId) => {
        gameSocket.to(gameId).emit('playerLeft', gameSocket.userId!);
      });
    });
  });
}; 