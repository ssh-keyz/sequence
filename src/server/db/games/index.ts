import db from "../connection";
import {
  ADD_PLAYER,
  ALL_PLAYER_DATA,
  AVAILABLE_CARDS_FOR_GAME,
  AVAILABLE_GAMES,
  CREATE_GAME,
  DEAL_CARDS,
  GET_PLAYER_HAND,
  GET_PLAYER_COUNT,
  INSERT_INITIAL_CARDS,
  IS_CURRENT,
  SHUFFLE_DISCARD_PILE,
  UPDATE_DRAW_TURN,
  GET_LAST_DRAW_TURN,
  UPDATE_PLAYER_DRAW_TURN,
} from "./sql";

type GameDescription = {
  id: number;
  players: number;
  player_count: number;
};

const create = async (playerId: number): Promise<GameDescription> => {
  const { id } = await db.one<GameDescription>(CREATE_GAME);

  await db.any(INSERT_INITIAL_CARDS, id);
  return await join(id, playerId);
};

const join = async (gameId: number, playerId: number) => {
  const gameDescription = await db.one<GameDescription>(ADD_PLAYER, [
    gameId,
    playerId,
  ]);

  // Pile 0 is the player's hand
  await db.any(DEAL_CARDS, [playerId, 0, gameId, 7]);
  // Pile -1 is the player's play pile
  await db.any(DEAL_CARDS, [playerId, -1, gameId, 20]);

  return gameDescription;
};

const availableGames = async (
  limit: number = 20,
  offset: number = 0,
): Promise<
  {
    id: number;
    players: number;
    currentPlayerIsMember?: boolean;
  }[]
> => {
  return db.any(AVAILABLE_GAMES, [limit, offset]);
};

const getPlayerCount = async (gameId: number): Promise<number> => {
  return parseInt(
    (await db.one<{ count: string }>(GET_PLAYER_COUNT, gameId)).count,
    10,
  );
};

const drawCard = async (gameId: number, userId: number) => {
  const availableCards = parseInt(
    (await db.one<{ count: string }>(AVAILABLE_CARDS_FOR_GAME, gameId)).count,
  );

  if (availableCards === 0) {
    await db.none(SHUFFLE_DISCARD_PILE, [gameId]);
  }

  const card = db.one<{ card_id: string }>(DEAL_CARDS, [userId, 0, gameId, 1]);

  await db.none(UPDATE_DRAW_TURN, [gameId, userId]);

  return card;
};

const incrementTurn = async (gameId: number) => {
  return db.none("UPDATE games SET turn = turn + 1 WHERE id = $1", gameId);
};

const getTurn = async (gameId: number) => {
  return db.one("SELECT turn FROM games WHERE id = $1", gameId);
};

// user_id: -1 for top of discard pile, -2 for bottom of discard pile
// N: -3, E: -4, S: -5, W: -6
const playCard = async () =>
  // playerId: number,
  // gameId: number,
  // cardId: string,
  // pile: number
  {};

const playerGames = async (
  playerId: number,
): Promise<Record<number, boolean>> => {
  return (
    await db.any("SELECT game_id FROM game_users WHERE user_id=$1", playerId)
  ).reduce((memo, game) => ({ ...memo, [game.game_id]: true }), {});
};

const get = async (gameId: number, playerId: number) => {
  const currentSeat = await db.one(
    "SELECT current_seat FROM games WHERE id=$1",
    gameId,
  );
  const players = await getPlayers(gameId);
  const playerHand = await db.any(GET_PLAYER_HAND, [playerId, gameId, 0, 8]);

  return {
    currentSeat,
    players,
    playerHand,
  };
};

const isCurrentPlayer = async (
  gameId: number,
  userId: number,
): Promise<{ is_current_player: boolean }> => {
  return await db.one(IS_CURRENT, [gameId, userId]);
};

const getPlayers = async (
  gameId: number,
): Promise<
  {
    gravatar: string;
    id: number;
    is_current: boolean;
    last_draw_turn: number;
    pile_1: number[];
    pile_2: number[];
    pile_3: number[];
    pile_4: number[];
    play_pile_top: number;
    play_pile_top_id: number;
    play_pile_count: number;
    seat: number;
    username: string;
  }[]
> => {
  return await db.any(ALL_PLAYER_DATA, [gameId]);
};

const getPlayerHand = async (gameId: number, playerId: number) => {
  return await db.any(GET_PLAYER_HAND, [playerId, gameId, 0]);
};

const getLastDrawTurn = async (
  gameId: number,
  userId: number,
): Promise<{ last_draw_turn: number }> => {
  return await db.one(GET_LAST_DRAW_TURN, [gameId, userId]);
};

const updatePlayerDrawTurn = async (gameId: number, userId: number) => {
  return db.none(UPDATE_PLAYER_DRAW_TURN, [gameId, userId]);
};

export default {
  create,
  join,
  availableGames,
  getPlayerCount,
  drawCard,
  playCard,
  playerGames,
  get,
  isCurrentPlayer,
  incrementTurn,
  getTurn,
  getPlayers,
  getPlayerHand,
  getLastDrawTurn,
  updatePlayerDrawTurn,
};
