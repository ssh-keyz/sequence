import { db } from '../config/database';
import {
  BOARD_LAYOUT,
  BOARD_SIZE,
  SEQUENCE_LENGTH,
  MAX_PLAYERS,
  MIN_PLAYERS,
  CARDS_PER_PLAYER,
  CORNER_POSITIONS,
  DECK_CONFIG
} from '../constants/gameConfig';

export interface Card {
  suit: string;
  value: string;
}

export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  board: Array<Array<Card | null>>;
  chips: Array<Array<string | null>>; // Player color or null
  currentPlayerIndex: number;
  players: Array<{
    id: string;
    username: string;
    cards: Card[];
    chips: Position[];
    color: string;
  }>;
  deck: Card[];
  status: 'waiting' | 'in_progress' | 'completed' | 'cancelled';
  winner?: string;
}

export interface GameMove {
  id: string;
  gameId: string;
  userId: string;
  cardPlayed: Card;
  position: Position;
  createdAt: Date;
}

export class GameModel {
  /**
   * Create a new game
   */
  static async create(creatorId: string): Promise<{ id: string; state: GameState }> {
    const initialState: GameState = {
      board: BOARD_LAYOUT,
      chips: Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)),
      currentPlayerIndex: 0,
      players: [{
        id: creatorId,
        username: '', // Will be populated after creation
        cards: [],
        chips: [],
        color: 'red'
      }],
      deck: this.createDeck(),
      status: 'waiting'
    };

    const game = await db.one<{ id: string; board_state: GameState }>(
      `
      INSERT INTO games (board_state, status)
      VALUES ($1, $2)
      RETURNING id, board_state
      `,
      [initialState, 'waiting']
    );

    // Add creator as first player
    await db.none(
      `
      INSERT INTO game_players (game_id, user_id, player_index, cards)
      VALUES ($1, $2, $3, $4)
      `,
      [game.id, creatorId, 0, []]
    );

    return { id: game.id, state: game.board_state };
  }

  /**
   * Join a game
   */
  static async join(gameId: string, userId: string): Promise<GameState> {
    const game = await db.one<{ board_state: GameState }>(
      `
      SELECT board_state
      FROM games
      WHERE id = $1 AND status = 'waiting'
      `,
      [gameId]
    );

    if (game.board_state.players.length >= MAX_PLAYERS) {
      throw new Error('Game is full');
    }

    if (game.board_state.players.some(p => p.id === userId)) {
      throw new Error('Player already in game');
    }

    const playerIndex = game.board_state.players.length;
    const playerColor = ['red', 'blue', 'green', 'yellow'][playerIndex];

    game.board_state.players.push({
      id: userId,
      username: '', // Will be populated after join
      cards: [],
      chips: [],
      color: playerColor
    });

    // Add player to game
    await db.none(
      `
      INSERT INTO game_players (game_id, user_id, player_index, cards)
      VALUES ($1, $2, $3, $4)
      `,
      [gameId, userId, playerIndex, []]
    );

    // Update game state
    await db.none(
      `
      UPDATE games
      SET board_state = $1
      WHERE id = $2
      `,
      [game.board_state, gameId]
    );

    return game.board_state;
  }

  /**
   * Start a game
   */
  static async start(gameId: string): Promise<GameState> {
    const game = await db.one<{ board_state: GameState }>(
      `
      SELECT board_state
      FROM games
      WHERE id = $1 AND status = 'waiting'
      `,
      [gameId]
    );

    if (game.board_state.players.length < MIN_PLAYERS) {
      throw new Error('Not enough players');
    }

    // Deal cards to players
    const deck = this.shuffleDeck(game.board_state.deck);
    
    game.board_state.players.forEach((player) => {
      player.cards = deck.splice(0, CARDS_PER_PLAYER);
    });

    game.board_state.deck = deck;
    game.board_state.status = 'in_progress';

    // Update game state and status
    await db.none(
      `
      UPDATE games
      SET board_state = $1, status = 'in_progress'
      WHERE id = $2
      `,
      [game.board_state, gameId]
    );

    // Update player cards
    for (const player of game.board_state.players) {
      await db.none(
        `
        UPDATE game_players
        SET cards = $1
        WHERE game_id = $2 AND user_id = $3
        `,
        [player.cards, gameId, player.id]
      );
    }

    return game.board_state;
  }

  /**
   * Make a move in the game
   */
  static async makeMove(
    gameId: string,
    userId: string,
    card: Card,
    position: Position
  ): Promise<GameState> {
    const game = await db.one<{ board_state: GameState }>(
      `
      SELECT board_state
      FROM games
      WHERE id = $1 AND status = 'in_progress'
      `,
      [gameId]
    );

    const playerIndex = game.board_state.players.findIndex(p => p.id === userId);
    
    if (playerIndex === -1) {
      throw new Error('Player not in game');
    }

    if (playerIndex !== game.board_state.currentPlayerIndex) {
      throw new Error('Not your turn');
    }

    if (!this.isValidMove(game.board_state, card, position)) {
      throw new Error('Invalid move');
    }

    // Record the move
    await db.none(
      `
      INSERT INTO game_moves (game_id, user_id, card_played, position)
      VALUES ($1, $2, $3, $4)
      `,
      [gameId, userId, card, position]
    );

    // Update game state
    const player = game.board_state.players[playerIndex];
    
    // Remove card from player's hand
    player.cards = player.cards.filter(c => 
      !(c.suit === card.suit && c.value === card.value)
    );
    
    // Add chip to board
    game.board_state.chips[position.y][position.x] = player.color;
    player.chips.push(position);

    // Draw a new card if deck is not empty
    if (game.board_state.deck.length > 0) {
      player.cards.push(game.board_state.deck.pop()!);
    }

    // Check for win condition
    if (this.checkWinCondition(game.board_state.chips, player.color)) {
      game.board_state.status = 'completed';
      game.board_state.winner = userId;
    } else {
      // Move to next player
      game.board_state.currentPlayerIndex = 
        (game.board_state.currentPlayerIndex + 1) % game.board_state.players.length;
    }

    // Update game state in database
    await db.none(
      `
      UPDATE games
      SET board_state = $1, status = $2, winner_id = $3
      WHERE id = $4
      `,
      [
        game.board_state,
        game.board_state.status,
        game.board_state.winner || null,
        gameId
      ]
    );

    // Update player cards
    await db.none(
      `
      UPDATE game_players
      SET cards = $1
      WHERE game_id = $2 AND user_id = $3
      `,
      [player.cards, gameId, userId]
    );

    return game.board_state;
  }

  /**
   * Get current game state
   */
  static async getState(gameId: string): Promise<GameState> {
    const game = await db.one<{ board_state: GameState }>(
      `
      SELECT board_state
      FROM games
      WHERE id = $1
      `,
      [gameId]
    );

    return game.board_state;
  }

  /**
   * List available games
   */
  static async listGames(): Promise<Array<{
    id: string;
    playerCount: number;
    status: string;
    createdAt: Date;
  }>> {
    const result = await db.query(`
      SELECT g.id, 
             COUNT(gp.id) as player_count, 
             g.status, 
             g.created_at
      FROM games g
      LEFT JOIN game_players gp ON g.id = gp.game_id
      WHERE g.status = 'waiting'
      GROUP BY g.id
      ORDER BY g.created_at DESC
    `);

    return result.rows.map((row: { id: any; player_count: string; status: any; created_at: any; }) => ({
      id: row.id,
      playerCount: parseInt(row.player_count),
      status: row.status,
      createdAt: row.created_at
    }));
  }

  // Helper methods

  private static createDeck(): Card[] {
    const deck: Card[] = [];
    const { suits, values, duplicatevalues, deckCount } = DECK_CONFIG;

    for (let deckIndex = 0; deckIndex < deckCount; deckIndex++) {
      for (const suit of suits) {
        for (const value of values) {
          // Add each card twice (except Jacks)
          const card = { suit, value };
          deck.push(card);
          if (duplicatevalues && value !== 'J') {
            deck.push({ ...card });
          }
        }
      }
    }
    
    return this.shuffleDeck(deck);
  }

  private static shuffleDeck(deck: Card[]): Card[] {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private static isValidMove(state: GameState, card: Card, position: Position): boolean {
    const { x, y } = position;

    // Check if position is within bounds
    if (x < 0 || x >= BOARD_SIZE || y < 0 || y >= BOARD_SIZE) {
      return false;
    }

    // Check if position is already taken
    if (state.chips[y][x] !== null) {
      return false;
    }

    // Check if it's a corner (free space)
    if (CORNER_POSITIONS.some(pos => pos.x === x && pos.y === y)) {
      return true;
    }

    // Get the card at the board position
    const boardCard = state.board[y][x];
    if (!boardCard) {
      return false;
    }

    // Check if player has the card
    const player = state.players[state.currentPlayerIndex];
    const hasCard = player.cards.some(c => 
      c.suit === card.suit && c.value === card.value
    );

    if (!hasCard) {
      return false;
    }

    // Handle Jacks
    if (card.value === 'J') {
      if (card.suit === 'hearts' || card.suit === 'diamonds') {
        // One-eyed Jack (remove any chip)
        return state.chips[y][x] !== null;
      } else {
        // Two-eyed Jack (place chip anywhere)
        return state.chips[y][x] === null;
      }
    }

    // Normal card - must match the board position
    return boardCard.suit === card.suit && boardCard.value === card.value;
  }

  private static checkWinCondition(chips: Array<Array<string | null>>, playerColor: string): boolean {
    // Check horizontal sequences
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x <= BOARD_SIZE - SEQUENCE_LENGTH; x++) {
        if (this.checkSequence(chips, x, y, 1, 0, playerColor)) {
          return true;
        }
      }
    }

    // Check vertical sequences
    for (let y = 0; y <= BOARD_SIZE - SEQUENCE_LENGTH; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        if (this.checkSequence(chips, x, y, 0, 1, playerColor)) {
          return true;
        }
      }
    }

    // Check diagonal sequences (top-left to bottom-right)
    for (let y = 0; y <= BOARD_SIZE - SEQUENCE_LENGTH; y++) {
      for (let x = 0; x <= BOARD_SIZE - SEQUENCE_LENGTH; x++) {
        if (this.checkSequence(chips, x, y, 1, 1, playerColor)) {
          return true;
        }
      }
    }

    // Check diagonal sequences (top-right to bottom-left)
    for (let y = 0; y <= BOARD_SIZE - SEQUENCE_LENGTH; y++) {
      for (let x = SEQUENCE_LENGTH - 1; x < BOARD_SIZE; x++) {
        if (this.checkSequence(chips, x, y, -1, 1, playerColor)) {
          return true;
        }
      }
    }

    return false;
  }

  private static checkSequence(
    chips: Array<Array<string | null>>,
    startX: number,
    startY: number,
    dx: number,
    dy: number,
    playerColor: string
  ): boolean {
    for (let i = 0; i < SEQUENCE_LENGTH; i++) {
      const x = startX + i * dx;
      const y = startY + i * dy;
      if (chips[y][x] !== playerColor) {
        return false;
      }
    }
    return true;
  }
} 