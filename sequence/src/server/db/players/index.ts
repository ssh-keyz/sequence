import db from "../connection";
import { CREATE_PLAYER, FIND_BY_SESSION } from "./sql";

type Player = {
  id: number;
  session_id: string;
};

const create = async (sessionId: string): Promise<Player> => {
  return await db.one(CREATE_PLAYER, [sessionId]);
};

const findBySession = async (sessionId: string): Promise<Player | null> => {
  return await db.oneOrNone(FIND_BY_SESSION, [sessionId]);
};

const getOrCreate = async (sessionId: string): Promise<Player> => {
  const player = await findBySession(sessionId);
  if (player) {
    return player;
  }
  return await create(sessionId);
};

export default {
  create,
  findBySession,
  getOrCreate,
}; 