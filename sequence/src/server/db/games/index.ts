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
  const game = await db.one<GameDescription>(CREATE_GAME);
  await db.any(INSERT_INITIAL_CARDS, [game.id]);
  return await join(game.id, playerId);
};

const join = async (gameId: number, playerId: number) => {
  const gameDescription = await db.one<GameDescription>(ADD_PLAYER, [
    gameId,
    playerId,
  ]);

  // Deal initial cards
  await db.any(DEAL_CARDS, [playerId, 0, gameId, 7]); // Hand
  await db.any(DEAL_CARDS, [playerId, -1, gameId, 20]); // Play pile

  return gameDescription;
};

const availableGames = async (
  limit: number = 20,
  offset: number = 0,
): Promise<GameDescription[]> => {
  return db.any(AVAILABLE_GAMES, [limit, offset]);
};

const getPlayerCount = async (gameId: number): Promise<number> => {
  const result = await db.one(GET_PLAYER_COUNT, [gameId]);
  return parseInt(result.count);
};

const drawCard = async (gameId: number, playerId: number, count: number = 1) => {
  const availableCards = await db.one<{ count: string }>(AVAILABLE_CARDS_FOR_GAME, [gameId]);
  
  if (parseInt(availableCards.count) < count) {
    await db.none(SHUFFLE_DISCARD_PILE, [gameId]);
  }

  return await db.any(DEAL_CARDS, [playerId, 0, gameId, count]);
};

const isCurrentPlayer = async (gameId: number, playerId: number): Promise<{ is_current_player: boolean }> => {
  const result = await db.one(IS_CURRENT, [gameId, playerId]);
  return { is_current_player: result.is_current_player };
};

const getTurn = async (gameId: number): Promise<{ turn: number }> => {
  return await db.one("SELECT turn FROM games WHERE id = $1", [gameId]);
};

const getPlayers = async (gameId: number) => {
  return await db.any(ALL_PLAYER_DATA, [gameId]);
};

const getPlayerHand = async (gameId: number, playerId: number) => {
  return await db.any(GET_PLAYER_HAND, [playerId, gameId, 0]);
};

const getLastDrawTurn = async (gameId: number, playerId: number) => {
  return await db.one(GET_LAST_DRAW_TURN, [gameId, playerId]);
};

const updatePlayerDrawTurn = async (gameId: number, playerId: number) => {
  return await db.none(UPDATE_PLAYER_DRAW_TURN, [gameId, playerId]);
};

export default {
  create,
  join,
  availableGames,
  getPlayerCount,
  drawCard,
  isCurrentPlayer,
  getTurn,
  getPlayers,
  getPlayerHand,
  getLastDrawTurn,
  updatePlayerDrawTurn,
};
