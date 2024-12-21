import './auth';
import './chat';

// Extract room ID from URL if present
const pathParts = window.location.pathname.split('/');
const gameIndex = pathParts.indexOf('games');
if (gameIndex !== -1 && pathParts[gameIndex + 1]) {
  window.roomId = pathParts[gameIndex + 1];
}

// Add any other client-side functionality imports here
