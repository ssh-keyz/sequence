export type Card = {
  id: number;
  value: number;
};

export type Player = {
  gravatar: string;
  hand: Card[];
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
};

export type GameState = {
  players: Omit<Player, "hand">[];
  player: Player;
};
