# Sequence Game

A real-time multiplayer implementation of the Sequence board game using Node.js, PostgreSQL, and Socket.IO.

## Features

- User authentication with JWT
- Real-time game updates using Socket.IO
- Persistent game state with PostgreSQL
- Support for 2-4 players
- Move validation and game rules enforcement
- Secure API endpoints
- Rate limiting and CORS protection

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd sequence-game
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=sequence_game
   DB_USER=postgres
   DB_PASSWORD=postgres

   # JWT Configuration
   JWT_SECRET=your-super-secret-key-change-this-in-production
   JWT_EXPIRY=24h
   JWT_REFRESH_EXPIRY=7d

   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # Session Configuration
   SESSION_SECRET=another-super-secret-key-change-this-in-production
   SESSION_COOKIE_MAX_AGE=86400000
   ```

4. Create the database:
   ```bash
   createdb sequence_game
   ```

5. Run database migrations:
   ```bash
   npm run db:migrate
   ```

6. Start the development server:
   ```bash
   npm run start:dev
   ```

## API Documentation

### Authentication Endpoints

#### Register a new user
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "player1",
  "email": "player1@example.com",
  "password": "securepassword123"
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "player1",
  "password": "securepassword123"
}
```

### Game Endpoints

#### Create a new game
```
POST /api/games
Authorization: Bearer <token>
```

#### Join a game
```
POST /api/games/:gameId/join
Authorization: Bearer <token>
```

#### Make a move
```
POST /api/games/:gameId/move
Authorization: Bearer <token>
Content-Type: application/json

{
  "card": {
    "suit": "hearts",
    "rank": "10"
  },
  "position": {
    "x": 5,
    "y": 3
  }
}
```

## Socket.IO Events

### Client Events

- `join-game`: Join a game room
- `leave-game`: Leave a game room
- `make-move`: Make a move in the game
- `request-game-state`: Request current game state
- `start-game`: Start the game

### Server Events

- `game-state`: Current game state
- `game-updated`: Game state after a move
- `player-joined`: New player joined
- `player-left`: Player left
- `game-over`: Game completed
- `error`: Error event

## Development

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

### Building for Production
```bash
npm run build
```

## Deployment

1. Set up a production PostgreSQL database
2. Update the `.env` file with production values
3. Build the application:
   ```bash
   npm run build
   ```
4. Start the production server:
   ```bash
   npm start
   ```

## Security Considerations

- All authentication tokens are JWT-based
- Passwords are hashed using bcrypt
- API endpoints are protected with rate limiting
- CORS is configured for production
- Input validation on all endpoints
- SQL injection protection with parameterized queries

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
# sequence
