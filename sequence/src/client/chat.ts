import { io } from 'socket.io-client';
import { AuthService } from './services/auth';

interface ChatMessage {
  message: string;
  sender: string;
  timestamp: string;
  gravatar: string;
}

class ChatHandler {
  private form: HTMLFormElement;
  private input: HTMLInputElement;
  private messageArea: HTMLUListElement;
  private messageTemplate: HTMLTemplateElement;

  constructor() {
    this.form = document.querySelector<HTMLFormElement>('#chat-section form')!;
    this.input = document.querySelector<HTMLInputElement>('input#chat-message')!;
    this.messageArea = document.querySelector<HTMLUListElement>('#chat-section ul')!;
    this.messageTemplate = document.querySelector<HTMLTemplateElement>('#chat-message-template')!;

    if (!this.form || !this.input || !this.messageArea || !this.messageTemplate) {
      console.error('Required chat elements not found');
      return;
    }

    this.initializeSocket();
    this.initializeEventListeners();
  }

  private initializeSocket(): void {
    // Initialize socket with auth token
    window.socket = io({
      auth: {
        token: AuthService.getToken()
      },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000
    });

    // Handle socket events
    window.socket.on('connect', () => {
      console.log('Socket connected:', window.socket.id);
    });

    window.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    window.socket.on(`message:${window.roomId}`, this.handleIncomingMessage.bind(this));
  }

  private initializeEventListeners(): void {
    this.form.addEventListener('submit', this.handleSubmit.bind(this));
  }

  private async handleSubmit(e: SubmitEvent): Promise<void> {
    e.preventDefault();
    const message = this.input.value.trim();
    if (!message) return;

    try {
      const response = await fetch(`/chat/${window.roomId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...AuthService.getAuthHeader()
        },
        body: JSON.stringify({ message })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      this.input.value = '';
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  private handleIncomingMessage(message: ChatMessage): void {
    const messageElement = this.messageTemplate.content.cloneNode(true) as HTMLElement;
    const img = messageElement.querySelector('img');
    const span = messageElement.querySelector('span');

    if (img && span) {
      img.src = `https://www.gravatar.com/avatar/${message.gravatar}`;
      img.alt = message.sender;
      span.textContent = message.message;

      if (message.sender === 'system') {
        span.classList.add('text-red-500');
      }
    }

    this.messageArea.appendChild(messageElement);
    this.messageArea.scrollTo(0, this.messageArea.scrollHeight);
  }
}

// Initialize chat when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize chat if we're in a room
  if (window.roomId) {
    new ChatHandler();
  }
});
