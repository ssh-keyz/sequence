import { Card } from '../models/game';

export const BOARD_SIZE = 10;
export const SEQUENCE_LENGTH = 5;
export const MAX_PLAYERS = 4;
export const MIN_PLAYERS = 2;
export const CARDS_PER_PLAYER = 7;

// Define the board layout with card positions
export const BOARD_LAYOUT: Array<Array<Card | null>> = [
  // First row (0)
  [
    { suit: 'hearts', value: '2' },
    { suit: 'hearts', value: '3' },
    { suit: 'hearts', value: '4' },
    { suit: 'hearts', value: '5' },
    { suit: 'hearts', value: '6' },
    { suit: 'hearts', value: '7' },
    { suit: 'hearts', value: '8' },
    { suit: 'hearts', value: '9' },
    { suit: 'hearts', value: '10' },
    { suit: 'hearts', value: 'J' }
  ],
  // Second row (1)
  [
    { suit: 'diamonds', value: '6' },
    { suit: 'diamonds', value: '5' },
    { suit: 'diamonds', value: '4' },
    { suit: 'diamonds', value: '3' },
    { suit: 'diamonds', value: '2' },
    { suit: 'hearts', value: 'Q' },
    { suit: 'hearts', value: 'K' },
    { suit: 'hearts', value: 'A' },
    { suit: 'clubs', value: '2' },
    { suit: 'clubs', value: '3' }
  ],
  // Third row (2)
  [
    { suit: 'diamonds', value: '7' },
    { suit: 'spades', value: 'A' },
    { suit: 'spades', value: 'K' },
    { suit: 'spades', value: 'Q' },
    { suit: 'spades', value: 'J' },
    { suit: 'spades', value: '10' },
    { suit: 'spades', value: '9' },
    { suit: 'clubs', value: 'A' },
    { suit: 'clubs', value: '4' },
    { suit: 'clubs', value: '5' }
  ],
  // Fourth row (3)
  [
    { suit: 'diamonds', value: '8' },
    { suit: 'spades', value: '2' },
    { suit: 'diamonds', value: 'K' },
    { suit: 'diamonds', value: 'Q' },
    { suit: 'diamonds', value: 'J' },
    { suit: 'diamonds', value: '10' },
    { suit: 'spades', value: '8' },
    { suit: 'clubs', value: 'K' },
    { suit: 'clubs', value: '6' },
    { suit: 'clubs', value: '7' }
  ],
  // Fifth row (4)
  [
    { suit: 'diamonds', value: '9' },
    { suit: 'spades', value: '3' },
    { suit: 'diamonds', value: 'A' },
    null, // Corner
    { suit: 'hearts', value: 'A' },
    { suit: 'spades', value: 'A' },
    { suit: 'spades', value: '7' },
    { suit: 'clubs', value: 'Q' },
    { suit: 'clubs', value: '8' },
    { suit: 'clubs', value: '9' }
  ],
  // Sixth row (5)
  [
    { suit: 'diamonds', value: '10' },
    { suit: 'spades', value: '4' },
    { suit: 'hearts', value: 'K' },
    { suit: 'hearts', value: 'Q' },
    null, // Corner
    null, // Corner
    { suit: 'spades', value: '6' },
    { suit: 'clubs', value: 'J' },
    { suit: 'clubs', value: '9' },
    { suit: 'clubs', value: '10' }
  ],
  // Seventh row (6)
  [
    { suit: 'diamonds', value: 'J' },
    { suit: 'spades', value: '5' },
    { suit: 'hearts', value: 'J' },
    { suit: 'hearts', value: '10' },
    { suit: 'hearts', value: '9' },
    { suit: 'spades', value: 'A' },
    { suit: 'spades', value: '5' },
    { suit: 'clubs', value: '10' },
    { suit: 'clubs', value: 'J' },
    { suit: 'clubs', value: 'Q' }
  ],
  // Eighth row (7)
  [
    { suit: 'diamonds', value: 'Q' },
    { suit: 'spades', value: '6' },
    { suit: 'hearts', value: '8' },
    { suit: 'hearts', value: '7' },
    { suit: 'hearts', value: '6' },
    { suit: 'hearts', value: '5' },
    { suit: 'spades', value: '4' },
    { suit: 'clubs', value: '9' },
    { suit: 'clubs', value: 'K' },
    { suit: 'clubs', value: 'K' }
  ],
  // Ninth row (8)
  [
    { suit: 'diamonds', value: 'K' },
    { suit: 'spades', value: '7' },
    { suit: 'hearts', value: '5' },
    { suit: 'hearts', value: '4' },
    { suit: 'hearts', value: '3' },
    { suit: 'hearts', value: '2' },
    { suit: 'spades', value: '3' },
    { suit: 'clubs', value: '8' },
    { suit: 'clubs', value: 'A' },
    { suit: 'clubs', value: 'A' }
  ],
  // Tenth row (9)
  [
    { suit: 'diamonds', value: 'A' },
    { suit: 'spades', value: '8' },
    { suit: 'spades', value: '9' },
    { suit: 'spades', value: '10' },
    { suit: 'spades', value: 'J' },
    { suit: 'spades', value: 'Q' },
    { suit: 'spades', value: '2' },
    { suit: 'clubs', value: '7' },
    { suit: 'clubs', value: '6' },
    { suit: 'clubs', value: '5' }
  ]
];

// Define corner positions
export const CORNER_POSITIONS = [
  { x: 3, y: 4 },
  { x: 4, y: 4 },
  { x: 4, y: 5 },
  { x: 5, y: 4 }
];

// Define player colors
export const PLAYER_COLORS = ['red', 'blue', 'green', 'yellow'];

// Define card deck configuration
export const DECK_CONFIG = {
  suits: ['hearts', 'diamonds', 'clubs', 'spades'] as const,
  values: ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] as const,
  // Each value appears twice in the deck except for Jacks
  duplicatevalues: true,
  // Number of decks to use
  deckCount: 2
}; 