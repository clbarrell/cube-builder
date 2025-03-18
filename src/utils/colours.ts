// Generate a consistent color based on player name
export const getPlayerColor = (playerId: string): string => {
  // Simple hash function to generate a number from a string
  const hash = playerId.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  // Convert to HSL color with good saturation and lightness
  const h = Math.abs(hash % 360);
  return `hsl(${h}, 70%, 60%)`;
};
