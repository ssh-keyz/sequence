-- Drop authentication-related tables and columns
DROP TABLE IF EXISTS users CASCADE;

-- Create anonymous users table
CREATE TABLE IF NOT EXISTS players (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create games table
CREATE TABLE IF NOT EXISTS games (
    id SERIAL PRIMARY KEY,
    status VARCHAR(20) NOT NULL DEFAULT 'waiting',
    player_count INTEGER NOT NULL DEFAULT 4,
    current_seat INTEGER NOT NULL DEFAULT 1,
    turn INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT status_check CHECK (status IN ('waiting', 'in_progress', 'completed', 'cancelled'))
);

-- Create game_players table
CREATE TABLE IF NOT EXISTS game_players (
    id SERIAL PRIMARY KEY,
    game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    seat INTEGER NOT NULL,
    last_draw_turn INTEGER DEFAULT -1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(game_id, player_id),
    UNIQUE(game_id, seat)
);

-- Create cards table
CREATE TABLE IF NOT EXISTS cards (
    id SERIAL PRIMARY KEY,
    value INTEGER NOT NULL
);

-- Create game_cards table
CREATE TABLE IF NOT EXISTS game_cards (
    id SERIAL PRIMARY KEY,
    game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    card_id INTEGER NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    pile INTEGER NOT NULL DEFAULT 0
);

-- Insert initial card values
INSERT INTO cards (value)
SELECT value
FROM generate_series(1, 12) value
UNION ALL
SELECT value
FROM generate_series(1, 12) value
UNION ALL
SELECT 0 -- wild cards
FROM generate_series(1, 18);

-- Create indexes
CREATE INDEX IF NOT EXISTS games_status_idx ON games(status);
CREATE INDEX IF NOT EXISTS game_players_game_id_idx ON game_players(game_id);
CREATE INDEX IF NOT EXISTS game_cards_game_id_idx ON game_cards(game_id);
CREATE INDEX IF NOT EXISTS game_cards_player_id_idx ON game_cards(player_id); 