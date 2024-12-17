import { cardClickHandler } from "./games/card-click-handler";
import { updateGame } from "./games/index";

const gameId = window.location.pathname.split("/").pop();

window.socket.on(`game:${gameId}:updated`, (game) => {
  updateGame(game);
});

setTimeout(() => {
  fetch(`/games/${gameId}/update`);
}, 1000);

document
  .querySelector<HTMLFormElement>("#draw-pile")!
  .addEventListener("click", () => {
    fetch(`/games/${gameId}/draw`, { method: "POST" });
  });

document
  .querySelector<HTMLDivElement>("#playing-table")!
  .addEventListener("click", cardClickHandler);
