export const cardClickHandler = (event: MouseEvent) => {
  const card = event.target as HTMLElement;

  if (
    card.classList.contains("card") &&
    card.classList.contains("source-card")
  ) {
    event.preventDefault();

    console.log("source card clicked", { card });
  } else if (
    card.classList.contains("card") &&
    card.classList.contains("destination-card")
  ) {
    event.preventDefault();
  }
};
