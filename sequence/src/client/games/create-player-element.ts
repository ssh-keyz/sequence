import { Card, Player } from "../types";
import { getCardValue } from "./get-card-value";
import { updatePile } from "./update-pile";

const playerTemplate =
  document.querySelector<HTMLTemplateElement>("#player-template")!;
const cardTemplate =
  document.querySelector<HTMLTemplateElement>("#card-template")!;

export const createPlayerElement = ({
  username,
  gravatar,
  is_current,
  hand,
  play_pile_top,
  play_pile_top_id,
  play_pile_count,
  pile_1,
  pile_2,
  pile_3,
  pile_4,
}: Omit<Player, "hand"> & { hand?: Card[] }) => {
  const playerElement = playerTemplate.content.cloneNode(
    true,
  ) as HTMLDivElement;

  if (is_current) {
    playerElement.firstElementChild?.classList.add("current-player");
  }

  // Update gravatar
  const gravatarElement =
    playerElement.querySelector<HTMLImageElement>("h4 img")!;
  gravatarElement.src = `https://www.gravatar.com/avatar/${gravatar}`;
  gravatarElement.alt = username;

  // Update username
  playerElement.querySelector("h4 span.username")!.textContent = username;
  playerElement.querySelector("h4 span.card-count")!.textContent =
    `${play_pile_count} cards`;

  // Update hand
  const handElement = playerElement.querySelector<HTMLDivElement>(".hand")!;
  hand?.forEach((card) => {
    const cardElement = cardTemplate.content.cloneNode(true) as HTMLDivElement;

    const cardDiv = cardElement.querySelector<HTMLDivElement>("div.card")!;
    cardDiv.classList.add(`value-${card.value}`, "source-card");
    cardDiv.dataset.cardId = card.id.toString();

    cardElement.querySelector("span")!.textContent = getCardValue(card.value);

    handElement.appendChild(cardElement);
  });

  const topCard = cardTemplate.content.cloneNode(true) as HTMLDivElement;

  const topCardDiv = topCard.querySelector<HTMLDivElement>("div.card")!;
  topCardDiv.classList.add(`value-${play_pile_top}`, "source-card");
  topCardDiv.dataset.cardId = play_pile_top_id.toString();

  topCard.querySelector("span")!.textContent = getCardValue(play_pile_top);

  playerElement
    .querySelector<HTMLDivElement>(".player-pile-0")!
    .replaceChildren(topCard);

  updatePile(pile_1, ".player-pile-1", playerElement);
  updatePile(pile_2, ".player-pile-2", playerElement);
  updatePile(pile_3, ".player-pile-3", playerElement);
  updatePile(pile_4, ".player-pile-4", playerElement);

  return playerElement;
};
