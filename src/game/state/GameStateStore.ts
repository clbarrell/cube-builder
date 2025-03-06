import { create } from "zustand";
import {
  ensureSocketConnected,
  onStateSync,
  safeOn,
} from "../../services/socketService";

export enum GamePhase {
  LOBBY = "LOBBY",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface TimerState {
  startTime: number | null;
  duration: number | null;
  endTime: number | null;
  timeLeft: number | null;
}

interface GameStateStore {
  // State
  gamePhase: GamePhase;
  timer: TimerState;
  isInitialized: boolean;

  // Actions
  initialize: () => void;
  setGamePhase: (phase: GamePhase) => void;
  setTimer: (timer: Partial<TimerState>) => void;
  resetTimer: () => void;

  // Getters
  getFormattedTimeLeft: () => string;
  canModifyCubes: () => boolean;
}

export const useGameStateStore = create<GameStateStore>()((set, get) => ({
  // Initial state
  gamePhase: GamePhase.LOBBY,
  timer: {
    startTime: null,
    duration: null,
    endTime: null,
    timeLeft: null,
  },
  isInitialized: false,

  // Initialize socket listeners
  initialize: () => {
    // Prevent multiple initializations
    if (get().isInitialized) return;

    // Set up socket listeners
    ensureSocketConnected()
      .then(() => {
        // Listen for game state changes
        safeOn("game:state:change", (data: { phase: string }) => {
          set({ gamePhase: data.phase as GamePhase });
        });

        // Listen for timer updates
        safeOn(
          "timer:update",
          (data: { timeLeft?: number; endTime?: number }) => {
            set((state) => ({
              timer: {
                ...state.timer,
                ...data,
                timeLeft:
                  data.timeLeft ||
                  (data.endTime ? data.endTime - Date.now() : null),
              },
            }));
          }
        );

        // Listen for timer end
        safeOn("timer:end", () => {
          set({
            timer: {
              startTime: null,
              duration: null,
              endTime: null,
              timeLeft: null,
            },
          });
        });

        // Listen for state sync
        onStateSync((state) => {
          if (state.gamePhase) {
            set({ gamePhase: state.gamePhase as GamePhase });
          }

          if (state.timer) {
            set((currentState) => ({
              timer: {
                ...currentState.timer,
                ...state.timer,
                timeLeft: state.timer?.endTime
                  ? state.timer.endTime - Date.now()
                  : null,
              },
            }));
          }
        });

        set({ isInitialized: true });
      })
      .catch((error) => {
        console.error("Failed to connect socket for game state:", error);
      });
  },

  // Set game phase
  setGamePhase: (phase) => {
    set({ gamePhase: phase });
  },

  // Set timer
  setTimer: (timer) => {
    set((state) => ({
      timer: {
        ...state.timer,
        ...timer,
      },
    }));
  },

  // Reset timer
  resetTimer: () => {
    set({
      timer: {
        startTime: null,
        duration: null,
        endTime: null,
        timeLeft: null,
      },
    });
  },

  // Get formatted time left
  getFormattedTimeLeft: () => {
    const { timer } = get();

    // If there's no timer active, return empty string
    if (!timer.timeLeft && !timer.endTime) {
      return "";
    }

    const timeLeft =
      timer.timeLeft || (timer.endTime ? timer.endTime - Date.now() : 0);

    if (timeLeft <= 0) {
      return "00:00";
    }

    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);

    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  },

  // Check if cubes can be modified
  canModifyCubes: () => {
    return get().gamePhase === GamePhase.ACTIVE;
  },
}));

// Initialize game state listeners
export const initializeGameStateListeners = () => {
  useGameStateStore.getState().initialize();
};
