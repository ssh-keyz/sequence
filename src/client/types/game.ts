export interface Card {
  id?: string;
  suit: string;
  value: string;
}

export interface Position {
  x: number;
  y: number;
}

export interface Player {
  id: string;
  username: string;
  cards: Card[];
  chips: Position[];
  color: string;
}

export interface GameState {
  id: string;
  board: Array<Array<Card | null>>;
  chips: Array<Array<string | null>>;
  currentPlayerIndex: number;
  players: Player[];
  deck: Card[];
  status: 'waiting' | 'in_progress' | 'completed' | 'cancelled';
  winner?: string;
} 