import { GameManager } from './GameManager';
import { UIManager } from './UIManager';
import { GameState, Player, Card, Position, GameEventHandlers } from './types';

class SequenceGame {
  private gameManager: GameManager;
  private uiManager: UIManager;
  private gameId: string;
  private playerId: string;

  constructor(gameId: string, playerId: string) {
    this.gameId = gameId;
    this.playerId = playerId;
    this.gameManager = GameManager.getInstance(gameId, playerId);
    this.uiManager = new UIManager();

    this.setupEventHandlers();
    this.setupKeyboardControls();
  }

  private setupEventHandlers(): void {
    const eventHandlers: GameEventHandlers = {
      onGameUpdated: (state: GameState) => {
        this.uiManager.updateBoard(state.board);
        const currentPlayer = state.players.find(p => p.id === this.playerId);
        if (currentPlayer) {
          this.uiManager.updatePlayerHand(currentPlayer.cards);
        }
        this.uiManager.updatePlayerInfo(state.players, this.playerId);
      },

      onPlayerJoined: (player: Player) => {
        // Update UI with new player
        const state = this.gameManager.getGameState();
        this.uiManager.updatePlayerInfo(state.players, this.playerId);
      },

      onPlayerLeft: (playerId: string) => {
        // Update UI when player leaves
        const state = this.gameManager.getGameState();
        this.uiManager.updatePlayerInfo(state.players, this.playerId);
      },

      onGameStart: () => {
        // Initialize game board and UI
        const state = this.gameManager.getGameState();
        this.uiManager.updateBoard(state.board);
      },

      onTurnChange: (playerId: string) => {
        // Update turn indicator
        const state = this.gameManager.getGameState();
        this.uiManager.updatePlayerInfo(state.players, this.playerId);
      },

      onCardPlayed: (card: Card, position: Position) => {
        // Update board with played card
        const state = this.gameManager.getGameState();
        this.uiManager.updateBoard(state.board);
        this.uiManager.clearHighlights();
      },

      onSequenceCompleted: (positions: Position[]) => {
        // Highlight completed sequence
        this.uiManager.highlightValidMoves(positions); // Reusing highlight method for sequences
        setTimeout(() => this.uiManager.clearHighlights(), 2000);
      }
    };

    this.gameManager.setEventHandlers(eventHandlers);
  }

  private setupKeyboardControls(): void {
    document.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'Escape':
          this.uiManager.clearHighlights();
          break;
        case 'Enter':
          if (document.activeElement?.tagName === 'INPUT') {
            // Handle chat input
            const input = document.activeElement as HTMLInputElement;
            if (input.value.trim()) {
              // Emit chat message event
              input.value = '';
            }
          }
          break;
      }
    });
  }

  public static initialize(gameId: string, playerId: string): SequenceGame {
    return new SequenceGame(gameId, playerId);
  }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const gameId = new URLSearchParams(window.location.search).get('gameId');
  const playerId = new URLSearchParams(window.location.search).get('playerId');

  if (!gameId || !playerId) {
    console.error('Game ID and Player ID are required');
    return;
  }

  SequenceGame.initialize(gameId, playerId);
}); 