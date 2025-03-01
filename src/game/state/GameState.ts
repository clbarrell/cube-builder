import { create } from "zustand";

interface GameState {
  score: number;
  level: number;
  isPaused: boolean;
  isGameOver: boolean;

  // Actions
  incrementScore: (points: number) => void;
  nextLevel: () => void;
  togglePause: () => void;
  resetGame: () => void;
  gameOver: () => void;
}

// Initial state values
const initialState = {
  score: 0,
  level: 1,
  isPaused: false,
  isGameOver: false,
};

// Create the store
export const useGameState = create<GameState>((set) => ({
  ...initialState,

  // Actions
  incrementScore: (points) => set((state) => ({ score: state.score + points })),

  nextLevel: () => set((state) => ({ level: state.level + 1 })),

  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),

  resetGame: () => set(initialState),

  gameOver: () => set({ isGameOver: true }),
}));
