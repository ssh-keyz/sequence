import { Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

export interface GameRoom {
  id: string;
  players: string[];
  spectators: string[];
  gameState: any; // Replace with your game state type
}

export interface GameSocket extends Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData> {
  gameRooms: Map<string, GameRoom>;
  userId?: string;
}

export interface ServerToClientEvents {
  gameUpdate: (gameState: any) => void;
  playerJoined: (playerId: string) => void;
  playerLeft: (playerId: string) => void;
  gameError: (error: string) => void;
}

export interface ClientToServerEvents {
  joinGame: (gameId: string) => void;
  leaveGame: (gameId: string) => void;
  playCard: (gameId: string, cardId: string, position: { x: number; y: number }) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId: string;
  gameRooms: Map<string, GameRoom>;
} 