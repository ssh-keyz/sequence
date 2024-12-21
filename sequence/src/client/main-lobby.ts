const list = document.querySelector<HTMLTableSectionElement>(
  "#available-games-list",
)!;
const rowTemplate =
  document.querySelector<HTMLTemplateElement>("#game-row-template")!;

window.socket.on("game-created", (game) => {
  const row = rowTemplate.content.cloneNode(true) as HTMLTableRowElement;
  row.querySelector("tr")!.id = `game-row-${game.id}`;

  row.querySelector("td:nth-child(1)")!.textContent = `Game ${game.id}`;
  row.querySelector("td:nth-child(2)")!.textContent =
    `${game.players} / ${game.player_count}`;
  row.querySelector<HTMLFormElement>("td:nth-child(3) form")!.action =
    `/games/join/${game.id}`;

  list.appendChild(row);
});

window.socket.on("game-updated", (game) => {
  const row = list.querySelector<HTMLTableRowElement>(`#game-row-${game.id}`);

  if (row) {
    if (parseInt(game.players) === game.player_count) {
      row.remove();
    } else {
      row.querySelector("td:nth-child(2)")!.textContent =
        `${game.players} / ${game.player_count}`;
    }
  }
});
