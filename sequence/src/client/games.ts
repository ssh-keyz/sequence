import { io, Socket } from 'socket.io-client';

interface Player {
  id: number;
  username: string;
  gravatar: string;
  is_current: boolean;
  cards: number;
}

interface Card {
  id: number;
  value: number;
}

interface GameState {
  players: Player[];
  player: Player & {
    hand: Card[];
  };
}

interface ChatMessage {
  sender: string;
  message: string;
  timestamp: string;
}

// Get game ID from URL
const gameId = window.location.pathname.split('/').pop();

// Get templates
const cardTemplate = document.querySelector<HTMLTemplateElement>('#card-template')!;
const playerTemplate = document.querySelector<HTMLTemplateElement>('#player-template')!;

// Get DOM elements
const gameBoard = document.querySelector<HTMLDivElement>('#game-board')!;
const playerHand = document.querySelector<HTMLDivElement>('#player-hand')!;
const playersList = document.querySelector<HTMLDivElement>('#players-list')!;
const chatMessages = document.querySelector<HTMLDivElement>('#chat-messages')!;
const chatForm = document.querySelector<HTMLFormElement>('#chat-form')!;
const chatInput = document.querySelector<HTMLInputElement>('#chat-input')!;

// Initialize socket connection
const socket: Socket = io();

// Join game room
socket.emit('join-game', gameId);

// Handle game updates
socket.on(`game:${gameId}:updated`, (data: GameState) => {
  updateGame(data);
});

// Handle chat messages
socket.on(`chat:${gameId}:message`, (data: ChatMessage) => {
  addChatMessage(data);
});

// Handle chat form submission
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const message = chatInput.value.trim();
  if (message) {
    socket.emit('chat:message', {
      gameId,
      message
    });
    chatInput.value = '';
  }
});

// Update game state
function updateGame(data: GameState) {
  // Update players list
  playersList.innerHTML = '';
  data.players.forEach((player) => {
    const playerElement = playerTemplate.content.cloneNode(true) as DocumentFragment;
    const div = playerElement.querySelector<HTMLDivElement>('.player')!;
    const img = playerElement.querySelector<HTMLImageElement>('img')!;
    const nameSpan = playerElement.querySelector<HTMLSpanElement>('span:first-of-type')!;
    const statusSpan = playerElement.querySelector<HTMLSpanElement>('span:last-of-type')!;

    if (player.is_current) {
      div.classList.add('bg-blue-500');
    }

    img.src = `https://www.gravatar.com/avatar/${player.gravatar}?d=retro`;
    img.alt = player.username;
    nameSpan.textContent = player.username;
    statusSpan.textContent = `${player.cards} cards`;

    playersList.appendChild(playerElement);
  });

  // Update player's hand
  playerHand.innerHTML = '';
  data.player.hand.forEach((card) => {
    const cardElement = cardTemplate.content.cloneNode(true) as DocumentFragment;
    const div = cardElement.querySelector<HTMLDivElement>('.card')!;
    const span = cardElement.querySelector<HTMLSpanElement>('span')!;

    div.dataset.cardId = card.id.toString();
    span.textContent = card.value.toString();

    playerHand.appendChild(cardElement);
  });
}

// Add chat message
function addChatMessage(data: ChatMessage) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'p-2 bg-gray-600 rounded';

  const timestamp = new Date(data.timestamp).toLocaleTimeString();
  messageDiv.innerHTML = `
    <span class="text-gray-300">[${timestamp}]</span>
    <span class="font-bold">${data.sender}:</span>
    <span>${data.message}</span>
  `;

  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Initial game state update
fetch(`/games/${gameId}/update`)
  .then(response => response.json())
  .then((data: GameState) => updateGame(data))
  .catch(error => console.error('Error updating game:', error));

// Handle card clicks
function handleCardClick(event: MouseEvent) {
  const target = event.target as HTMLElement;
  if (target.classList.contains('card')) {
    const cardId = target.dataset.cardId;
    if (cardId) {
      console.log('Card clicked:', cardId);
      // TODO: Implement card play logic
    }
  }
}

gameBoard.addEventListener('click', handleCardClick);
