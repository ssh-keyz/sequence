import { getCardValue } from "./get-card-value";

const cardTemplate =
  document.querySelector<HTMLTemplateElement>("#card-template")!;

const BLANK_CARD = cardTemplate.content.cloneNode(true) as HTMLDivElement;
BLANK_CARD.querySelector("div.card")!.classList.add(
  "blank",
  "destination-card",
);

export const updatePile = (
  pile: number[],
  selector: string,
  element: HTMLDivElement,
) => {
  const pileElement = element.querySelector<HTMLDivElement>(selector)!;

  if (pile.length === 0) {
    pileElement.replaceChildren(BLANK_CARD.cloneNode(true));
  } else {
    pileElement.replaceChildren(
      ...pile.map((value) => {
        const cardElement = cardTemplate.content.cloneNode(
          true,
        ) as HTMLDivElement;

        cardElement
          .querySelector("div.card")!
          .classList.add(`value-${value}`, "destination-card");
        cardElement.querySelector("span")!.textContent = getCardValue(value);

        return cardElement;
      }),
    );
  }
};
