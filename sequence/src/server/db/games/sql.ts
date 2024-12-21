export const CREATE_GAME = `
INSERT INTO games (status, player_count, current_seat, turn)
VALUES ('waiting', 4, 1, 0)
RETURNING id, status, player_count, 1 as players
`;

export const ADD_PLAYER = `
INSERT INTO game_players (game_id, player_id, seat)
VALUES ($1, $2, (SELECT COUNT(*) FROM game_players WHERE game_id = $1) + 1)
RETURNING 
  game_id AS id, 
  (SELECT COUNT(*) FROM game_players WHERE game_id = $1) AS players,
  (SELECT player_count FROM games WHERE id = $1) AS player_count
`;

export const AVAILABLE_GAMES = `
SELECT *, 
  (SELECT COUNT(*) FROM game_players WHERE games.id=game_players.game_id) AS players 
FROM games WHERE id IN 
  (SELECT game_id FROM game_players GROUP BY game_id HAVING COUNT(*) < 4)
LIMIT $1
OFFSET $2
`;

export const GET_PLAYER_COUNT = `
SELECT COUNT(*) FROM game_players WHERE game_id = $1
`;

export const INSERT_INITIAL_CARDS = `
INSERT INTO game_cards (game_id, card_id, player_id, pile)
SELECT $1, id, NULL, -1 FROM cards
`;

export const DEAL_CARDS = `
UPDATE game_cards 
SET player_id = $1, pile = $2 
WHERE game_id = $3 AND player_id IS NULL 
AND id IN (
  SELECT id FROM game_cards 
  WHERE game_id = $3 AND player_id IS NULL 
  ORDER BY RANDOM() 
  LIMIT $4
) RETURNING card_id
`;

export const AVAILABLE_CARDS_FOR_GAME = `
SELECT COUNT(*) FROM game_cards WHERE game_id = $1 AND player_id IS NULL
`;

export const SHUFFLE_DISCARD_PILE = `
UPDATE game_cards SET player_id = NULL WHERE player_id = -1 AND game_id = $1
`;

export const UPDATE_DRAW_TURN = `
UPDATE game_players 
SET last_draw_turn = (SELECT turn FROM games WHERE id = $1) 
WHERE game_id = $1 AND player_id = $2
`;

export const IS_CURRENT = `
SELECT games.current_seat = game_players.seat AS is_current_player
FROM games, game_players
WHERE games.id = $1
AND game_players.player_id = $2
AND game_players.game_id = games.id
`;

export const ALL_PLAYER_DATA = `
SELECT 
  gp.player_id as id,
  gp.seat,
  gp.last_draw_turn,
  (
    SELECT games.current_seat = gp.seat 
    FROM games
    WHERE games.id = $1
  ) AS is_current,
  (
    SELECT c.value 
    FROM game_cards gc
    JOIN cards c ON gc.card_id = c.id
    WHERE gc.game_id = $1 
    AND gc.player_id = gp.player_id 
    AND gc.pile = -1 
    ORDER BY gc.id DESC 
    LIMIT 1
  ) AS play_pile_top,
  (
    SELECT gc.card_id
    FROM game_cards gc
    WHERE gc.game_id = $1 
    AND gc.player_id = gp.player_id 
    AND gc.pile = -1 
    ORDER BY gc.id DESC 
    LIMIT 1
  ) AS play_pile_top_id,
  (
    SELECT COUNT(*)::INTEGER
    FROM game_cards gc
    WHERE gc.game_id = $1 
    AND gc.player_id = gp.player_id 
    AND gc.pile = -1
  ) AS play_pile_count
FROM game_players gp
WHERE gp.game_id = $1
`;

export const GET_PLAYER_HAND = `
SELECT gc.*, c.value 
FROM game_cards gc
JOIN cards c ON gc.card_id = c.id
WHERE gc.player_id = $1 
AND gc.game_id = $2 
AND gc.pile = $3
ORDER BY gc.id DESC
`;

export const GET_LAST_DRAW_TURN = `
SELECT last_draw_turn 
FROM game_players 
WHERE game_id = $1 
AND player_id = $2
`;

export const UPDATE_PLAYER_DRAW_TURN = `
UPDATE game_players 
SET last_draw_turn = (SELECT turn FROM games WHERE id = $1) 
WHERE game_id = $1 
AND player_id = $2
`;
