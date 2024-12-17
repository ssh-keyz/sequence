export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type GameStatus = 'waiting' | 'in_progress' | 'completed';

export interface Position {
  x: number;
  y: number;
}

export interface Card {
  suit: Suit;
  value: string;
  position?: Position;
}

export interface Player {
  id: string;
  username: string;
  cards: Card[];
  chips: Position[];
  color: string;
  isCurrentTurn: boolean;
}

export interface GameState {
  board: Card[][];
  players: Player[];
  currentPlayer: Player;
  selectedCard: Card | null;
  gameStatus: GameStatus;
}

export interface CardSelectionHandler {
  onCardClick(card: Card): void;
  highlightValidMoves(card: Card): void;
  clearHighlights(): void;
}

export interface CardPlacementHandler {
  onPositionClick(position: Position): void;
  validatePlacement(card: Card, position: Position): boolean;
  performPlacement(card: Card, position: Position): Promise<void>;
}

export interface TurnHandler {
  startTurn(): void;
  endTurn(): void;
  updateTurnIndicator(): void;
}

export interface GameEventHandlers {
  onGameUpdated(state: GameState): void;
  onPlayerJoined(player: Player): void;
  onPlayerLeft(playerId: string): void;
  onGameStart(): void;
  onTurnChange(playerId: string): void;
  onCardPlayed(card: Card, position: Position): void;
  onSequenceCompleted(positions: Position[]): void;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  username: string;
  content: string;
  timestamp: Date;
} 