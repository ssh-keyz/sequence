export const getCardValue = (value: number): string => {
  if (value === 0) {
    return "Skip-Bo";
  } else {
    return value.toString();
  }
};
