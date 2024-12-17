import { GameState } from "../types";
import { createPlayerElement } from "./create-player-element";

const playerArea = document.querySelector<HTMLDivElement>("#player-area")!;
const opponentArea = document.querySelector<HTMLDivElement>("#opponent-area")!;

export const updateGame = (game: GameState) => {
  console.log(game);

  playerArea.replaceChildren(createPlayerElement(game.player));

  opponentArea.replaceChildren(
    ...game.players.map((player) => {
      return createPlayerElement(player);
    }),
  );
};
