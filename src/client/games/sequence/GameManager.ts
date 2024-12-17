import { io, Socket } from 'socket.io-client';
import {
  GameState,
  Player,
  Card,
  Position,
  GameEventHandlers,
  CardSelectionHandler,
  CardPlacementHandler,
  TurnHandler,
} from './types';

export class GameManager implements CardSelectionHandler, CardPlacementHandler, TurnHandler {
  private socket: Socket;
  private gameState: GameState;
  private eventHandlers: GameEventHandlers = {
    onGameUpdated: () => {},
    onPlayerJoined: () => {},
    onPlayerLeft: () => {},
    onGameStart: () => {},
    onTurnChange: () => {},
    onCardPlayed: () => {},
    onSequenceCompleted: () => {}
  };
  private gameId: string;
  private playerId: string;

  private static instance: GameManager | null = null;

  private constructor(gameId: string, playerId: string) {
    this.gameId = gameId;
    this.playerId = playerId;
    this.socket = io('/sequence');
    this.gameState = this.createInitialGameState();
    this.setupSocketListeners();
  }

  public static getInstance(gameId: string, playerId: string): GameManager {
    if (!GameManager.instance) {
      GameManager.instance = new GameManager(gameId, playerId);
    }
    return GameManager.instance;
  }

  private createInitialGameState(): GameState {
    return {
      board: [],
      players: [],
      currentPlayer: null as unknown as Player,
      selectedCard: null,
      gameStatus: 'waiting'
    };
  }

  private setupSocketListeners(): void {
    this.socket.on(`game:${this.gameId}:updated`, (state: GameState) => {
      this.gameState = state;
      this.eventHandlers.onGameUpdated(state);
    });

    this.socket.on('player:joined', (player: Player) => {
      this.eventHandlers.onPlayerJoined(player);
    });

    this.socket.on('player:left', (playerId: string) => {
      this.eventHandlers.onPlayerLeft(playerId);
    });

    this.socket.on('game:start', () => {
      this.eventHandlers.onGameStart();
    });

    this.socket.on('turn:change', (playerId: string) => {
      this.eventHandlers.onTurnChange(playerId);
    });

    this.socket.on('card:played', (data: { card: Card; position: Position }) => {
      this.eventHandlers.onCardPlayed(data.card, data.position);
    });

    this.socket.on('sequence:completed', (positions: Position[]) => {
      this.eventHandlers.onSequenceCompleted(positions);
    });
  }

  public setEventHandlers(handlers: GameEventHandlers): void {
    this.eventHandlers = handlers;
  }

  // CardSelectionHandler implementation
  public onCardClick(card: Card): void {
    if (!this.isCurrentPlayersTurn()) return;
    
    this.gameState.selectedCard = card;
    this.highlightValidMoves(card);
  }

  public highlightValidMoves(card: Card): void {
    const validPositions = this.findValidPositions(card);
    // Implementation will be added in UI manager
  }

  public clearHighlights(): void {
    // Implementation will be added in UI manager
  }

  // CardPlacementHandler implementation
  public onPositionClick(position: Position): void {
    if (!this.gameState.selectedCard || !this.isCurrentPlayersTurn()) return;
    
    if (this.validatePlacement(this.gameState.selectedCard, position)) {
      this.performPlacement(this.gameState.selectedCard, position);
    }
  }

  public validatePlacement(card: Card, position: Position): boolean {
    // Implement validation logic based on game rules
    return true; // Placeholder
  }

  public async performPlacement(card: Card, position: Position): Promise<void> {
    try {
      await this.socket.emit('play:card', {
        gameId: this.gameId,
        card,
        position
      });
    } catch (error) {
      console.error('Error playing card:', error);
    }
  }

  // TurnHandler implementation
  public startTurn(): void {
    // Implement turn start logic
  }

  public endTurn(): void {
    if (!this.isCurrentPlayersTurn()) return;
    this.socket.emit('end:turn', { gameId: this.gameId });
  }

  public updateTurnIndicator(): void {
    // Implementation will be added in UI manager
  }

  // Helper methods
  private isCurrentPlayersTurn(): boolean {
    return this.gameState.currentPlayer?.id === this.playerId;
  }

  private findValidPositions(card: Card): Position[] {
    // Implement logic to find valid positions for the card
    return []; // Placeholder
  }

  // Public getters
  public getGameState(): GameState {
    return this.gameState;
  }

  public getCurrentPlayer(): Player | null {
    return this.gameState.currentPlayer;
  }

  public getPlayerId(): string {
    return this.playerId;
  }
} 