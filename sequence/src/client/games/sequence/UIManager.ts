import { GameState, Card, Position, Player } from './types';

export class UIManager {
  private boardElement: HTMLElement;
  private playerHandElement: HTMLElement;
  private playerInfoElement: HTMLElement;
  private chatElement: HTMLElement;
  private selectedCardElement: HTMLElement | null = null;

  constructor() {
    this.boardElement = document.getElementById('game-board') as HTMLElement;
    this.playerHandElement = document.getElementById('player-hand') as HTMLElement;
    this.playerInfoElement = document.getElementById('player-info') as HTMLElement;
    this.chatElement = document.getElementById('chat-container') as HTMLElement;
    
    this.initializeUI();
  }

  private initializeUI(): void {
    this.createBoard();
    this.createPlayerHand();
    this.createPlayerInfo();
    this.createChat();
    this.setupEventListeners();
  }

  private createBoard(): void {
    this.boardElement.classList.add('grid', 'grid-cols-10', 'gap-1', 'p-4', 'bg-gray-100', 'rounded-lg');
    
    // Create 10x10 grid
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        const cell = document.createElement('div');
        cell.classList.add(
          'w-16',
          'h-24',
          'border',
          'border-gray-300',
          'rounded',
          'flex',
          'items-center',
          'justify-center',
          'bg-white',
          'hover:bg-gray-50',
          'cursor-pointer'
        );
        cell.dataset.x = x.toString();
        cell.dataset.y = y.toString();
        this.boardElement.appendChild(cell);
      }
    }
  }

  private createPlayerHand(): void {
    this.playerHandElement.classList.add(
      'flex',
      'gap-2',
      'p-4',
      'bg-gray-100',
      'rounded-lg',
      'overflow-x-auto'
    );
  }

  private createPlayerInfo(): void {
    this.playerInfoElement.classList.add(
      'flex',
      'flex-col',
      'gap-4',
      'p-4',
      'bg-gray-100',
      'rounded-lg'
    );
  }

  private createChat(): void {
    const chatMessages = document.createElement('div');
    chatMessages.id = 'chat-messages';
    chatMessages.classList.add(
      'flex',
      'flex-col',
      'gap-2',
      'p-4',
      'bg-white',
      'rounded-lg',
      'h-64',
      'overflow-y-auto'
    );

    const chatInput = document.createElement('div');
    chatInput.classList.add('flex', 'gap-2', 'p-2');
    
    const input = document.createElement('input');
    input.type = 'text';
    input.classList.add(
      'flex-1',
      'px-3',
      'py-2',
      'border',
      'border-gray-300',
      'rounded',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-blue-500'
    );

    const button = document.createElement('button');
    button.textContent = 'Send';
    button.classList.add(
      'px-4',
      'py-2',
      'bg-blue-500',
      'text-white',
      'rounded',
      'hover:bg-blue-600',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-blue-500'
    );

    chatInput.appendChild(input);
    chatInput.appendChild(button);
    this.chatElement.appendChild(chatMessages);
    this.chatElement.appendChild(chatInput);
  }

  private setupEventListeners(): void {
    // Board cell click events
    this.boardElement.addEventListener('click', (e) => {
      const cell = (e.target as HTMLElement).closest('[data-x]') as HTMLElement;
      if (!cell) return;

      const x = parseInt(cell.dataset.x || '0', 10);
      const y = parseInt(cell.dataset.y || '0', 10);
      this.onBoardCellClick({ x, y });
    });

    // Card selection events
    this.playerHandElement.addEventListener('click', (e) => {
      const card = (e.target as HTMLElement).closest('.card') as HTMLElement;
      if (!card) return;

      this.onCardClick(card);
    });
  }

  public updateBoard(board: Card[][]): void {
    const cells = this.boardElement.children;
    board.forEach((row, y) => {
      row.forEach((card, x) => {
        const cell = cells[y * 10 + x] as HTMLElement;
        this.renderCard(cell, card);
      });
    });
  }

  public updatePlayerHand(cards: Card[]): void {
    this.playerHandElement.innerHTML = '';
    cards.forEach(card => {
      const cardElement = this.createCardElement(card);
      this.playerHandElement.appendChild(cardElement);
    });
  }

  public updatePlayerInfo(players: Player[], currentPlayerId: string): void {
    this.playerInfoElement.innerHTML = '';
    players.forEach(player => {
      const playerElement = document.createElement('div');
      playerElement.classList.add(
        'flex',
        'items-center',
        'gap-2',
        'p-2',
        'rounded',
        player.isCurrentTurn ? 'bg-blue-100' : 'bg-white'
      );

      const nameElement = document.createElement('span');
      nameElement.textContent = player.username;
      nameElement.classList.add(player.id === currentPlayerId ? 'font-bold' : 'font-normal');

      const chipCount = document.createElement('span');
      chipCount.textContent = `Chips: ${player.chips.length}`;
      chipCount.classList.add('text-sm', 'text-gray-600');

      playerElement.appendChild(nameElement);
      playerElement.appendChild(chipCount);
      this.playerInfoElement.appendChild(playerElement);
    });
  }

  public addChatMessage(username: string, message: string): void {
    const messageElement = document.createElement('div');
    messageElement.classList.add('p-2', 'bg-white', 'rounded');

    const usernameSpan = document.createElement('span');
    usernameSpan.textContent = username + ': ';
    usernameSpan.classList.add('font-bold');

    const messageSpan = document.createElement('span');
    messageSpan.textContent = message;

    messageElement.appendChild(usernameSpan);
    messageElement.appendChild(messageSpan);

    const chatMessages = document.getElementById('chat-messages');
    chatMessages?.appendChild(messageElement);
    chatMessages?.scrollTo(0, chatMessages.scrollHeight);
  }

  private createCardElement(card: Card): HTMLElement {
    const cardElement = document.createElement('div');
    cardElement.classList.add(
      'card',
      'w-16',
      'h-24',
      'border',
      'border-gray-300',
      'rounded',
      'flex',
      'flex-col',
      'items-center',
      'justify-center',
      'bg-white',
      'hover:bg-gray-50',
      'cursor-pointer'
    );

    const suitElement = document.createElement('span');
    suitElement.textContent = this.getSuitSymbol(card.suit);
    suitElement.classList.add(
      'text-2xl',
      card.suit === 'hearts' || card.suit === 'diamonds' ? 'text-red-500' : 'text-black'
    );

    const valueElement = document.createElement('span');
    valueElement.textContent = card.value;
    valueElement.classList.add('text-lg');

    cardElement.appendChild(valueElement);
    cardElement.appendChild(suitElement);

    return cardElement;
  }

  private getSuitSymbol(suit: string): string {
    const symbols: { [key: string]: string } = {
      hearts: '♥',
      diamonds: '♦',
      clubs: '♣',
      spades: '♠'
    };
    return symbols[suit] || suit;
  }

  private renderCard(cell: HTMLElement, card: Card | null): void {
    cell.innerHTML = '';
    if (card) {
      const cardElement = this.createCardElement(card);
      cell.appendChild(cardElement);
    }
  }

  private onBoardCellClick(position: Position): void {
    // This will be connected to the GameManager's handler
    console.log('Board cell clicked:', position);
  }

  private onCardClick(cardElement: HTMLElement): void {
    // This will be connected to the GameManager's handler
    if (this.selectedCardElement) {
      this.selectedCardElement.classList.remove('ring-2', 'ring-blue-500');
    }
    cardElement.classList.add('ring-2', 'ring-blue-500');
    this.selectedCardElement = cardElement;
  }

  public highlightValidMoves(positions: Position[]): void {
    const cells = this.boardElement.children;
    positions.forEach(pos => {
      const cell = cells[pos.y * 10 + pos.x] as HTMLElement;
      cell.classList.add('ring-2', 'ring-green-500');
    });
  }

  public clearHighlights(): void {
    const cells = this.boardElement.children;
    Array.from(cells).forEach(cell => {
      cell.classList.remove('ring-2', 'ring-green-500');
    });
  }
} 