import { create } from "zustand";
import { Vector3 } from "three";
import {
  Player,
  joinGame as joinGameService,
  updatePosition as updatePositionService,
  onPlayerJoin,
  onPlayerLeave,
  onPlayerMove,
  onStateSync,
  offAllEvents,
  disconnect,
  ensureSocketConnected,
} from "../../services/socketService";
import { initializeCubeSocketListeners } from "./CubeState";

interface PlayerState {
  // Player data
  players: Record<string, Player>;
  localPlayerId: string | null;
  localPlayerName: string | null;
  count: number;
  isInitialized: boolean;

  // Actions
  initialize: () => void;
  joinGame: (name: string, position: Vector3) => Promise<boolean>;
  updatePosition: (
    position: Vector3,
    rotation: { x: number; y: number }
  ) => void;
  setLocalPlayer: (id: string, name: string) => void;
  cleanup: () => void;

  // Getters
  getLocalPlayer: () => Player | null;
  getOtherPlayers: () => Player[];
  getPlayerNames: () => string[];
}

export const usePlayerStore = create<PlayerState>()((set, get) => ({
  // Initial state
  players: {},
  localPlayerId: null,
  localPlayerName: null,
  count: 0,
  isInitialized: false,

  // Initialize socket connection and event listeners
  initialize: () => {
    // Prevent multiple initializations
    if (get().isInitialized) return;

    // Use ensureSocketConnected instead of initializeSocket
    ensureSocketConnected()
      .then((socket) => {
        console.log("Socket connected. Now setting up event listeners.");

        // Set up event listeners
        onPlayerJoin((player) => {
          console.log("Player joined:", player);
          set((state) => {
            // Skip if player already exists
            if (state.players[player.id]) return state;

            const newPlayers = { ...state.players, [player.id]: player };
            return {
              players: newPlayers,
              count: Object.keys(newPlayers).length,
            };
          });
        });

        // Register all event handlers before any async operations
        onPlayerLeave(({ id }) => {
          set((state) => {
            // Skip if player doesn't exist
            if (!state.players[id]) return state;
            console.log("Player left:", state.players[id].name);

            const newPlayers = { ...state.players };
            delete newPlayers[id];

            return {
              players: newPlayers,
              count: Object.keys(newPlayers).length,
            };
          });
        });

        onPlayerMove(({ id, position, rotation }) => {
          set((state) => {
            // Skip update if player doesn't exist
            if (!state.players[id]) return state;

            const currentPlayer = state.players[id];

            // Skip update if no actual change
            if (
              !hasPositionChanged(currentPlayer.position, position) &&
              !hasRotationChanged(currentPlayer.rotation, rotation)
            ) {
              return state;
            }

            return {
              players: {
                ...state.players,
                [id]: {
                  ...state.players[id],
                  position,
                  rotation,
                },
              },
            };
          });
        });

        onStateSync((state) => {
          console.log(new Date().toLocaleTimeString(), "State synced:", state);
          set({
            players: state.players,
            count: Object.keys(state.players).length,
          });
        });

        // Set socket ID as local player ID when connected
        socket.on("connect", () => {
          console.log("Connected to server with ID:", socket.id);

          // If we already have a local player name, update the ID
          const { localPlayerName } = get();
          if (localPlayerName) {
            set({ localPlayerId: socket.id });
          }
        });

        // Initialize cube socket listeners
        initializeCubeSocketListeners();

        // Mark as initialized only after successful connection and handler registration
        set({ isInitialized: true });
      })
      .catch((error) => {
        console.error("Failed to connect socket:", error);
      });
  },

  // Join the game with a name
  joinGame: async (name, position) => {
    const success = await joinGameService(name, position);
    return success;
  },

  // Update player position
  updatePosition: (position, rotation) => {
    updatePositionService(position, rotation);

    // Also update local state for immediate feedback
    const { localPlayerId, players } = get();
    if (localPlayerId && players[localPlayerId]) {
      const currentPlayer = players[localPlayerId];

      // Skip update if no actual change
      if (
        !hasPositionChanged(currentPlayer.position, position) &&
        !hasRotationChanged(currentPlayer.rotation, rotation)
      ) {
        return;
      }

      set((state) => ({
        players: {
          ...state.players,
          [localPlayerId]: {
            ...state.players[localPlayerId],
            position: {
              x: position.x,
              y: position.y,
              z: position.z,
            },
            rotation: {
              x: rotation.x,
              y: rotation.y,
            },
          },
        },
      }));
    }
  },

  // Set local player ID and name
  setLocalPlayer: (id, name) => {
    set({
      localPlayerId: id,
      localPlayerName: name,
    });
  },

  // Clean up event listeners and disconnect
  cleanup: () => {
    offAllEvents();
    disconnect();
    set({
      players: {},
      localPlayerId: null,
      localPlayerName: null,
      count: 0,
      isInitialized: false,
    });
  },

  // Get local player data
  getLocalPlayer: () => {
    const { players, localPlayerId } = get();
    return localPlayerId && players[localPlayerId]
      ? players[localPlayerId]
      : null;
  },

  // Get other players (excluding local player)
  getOtherPlayers: () => {
    const { players, localPlayerId } = get();
    return Object.values(players).filter(
      (player) => player.id !== localPlayerId
    );
  },

  // Get player names
  getPlayerNames: () => {
    const { players } = get();
    return Object.values(players).map((player) => player.name);
  },
}));

// Helper functions for change detection
const hasPositionChanged = (
  pos1: { x: number; y: number; z: number },
  pos2: { x: number; y: number; z: number }
) => pos1.x !== pos2.x || pos1.y !== pos2.y || pos1.z !== pos2.z;

const hasRotationChanged = (
  rot1: { x: number; y: number },
  rot2: { x: number; y: number }
) => rot1.x !== rot2.x || rot1.y !== rot2.y;
