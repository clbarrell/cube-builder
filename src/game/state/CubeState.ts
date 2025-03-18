import { create } from "zustand";
import * as THREE from "three";
import {
  Cube,
  onStateSync,
  onCubeAdd,
  onCubeRemove,
  onCubesReset,
  ensureSocketConnected,
  addCube as addCubeService,
  removeCube as removeCubeService,
} from "../../services/socketService";
import { usePlayerStore } from "./PlayerState";
import { useGameStateStore } from "./GameStateStore";

interface CubeState {
  cubes: Cube[];
  maxCubesPerPlayer: number;
  addCube: (position: THREE.Vector3) => void;
  removeCube: (position: THREE.Vector3) => void;
  syncCubes: (cubes: Cube[]) => void;
  hasReachedLimit: () => boolean;
  getCubesByPlayer: (playerId: string) => Cube[];
  getCubeAtPosition: (position: THREE.Vector3) => Cube | undefined;
}

export const useCubeStore = create<CubeState>()((set, get) => ({
  cubes: [],
  maxCubesPerPlayer: 10,

  addCube: (position) => {
    const localPlayer = usePlayerStore.getState().getLocalPlayer();
    const canModifyCubes = useGameStateStore.getState().canModifyCubes();

    // Don't proceed if player isn't initialized
    if (!localPlayer) {
      console.warn("Cannot add cube: Local player not initialized");
      return;
    }

    // Check if game is in active state
    if (!canModifyCubes) {
      console.warn("Cannot add cube: Game is not active");
      return;
    }

    // Check if player has reached their cube limit
    if (get().hasReachedLimit()) {
      console.warn("Cannot add cube: Reached cube limit");
      return;
    }

    // Check if a cube already exists at this position
    const exists = get().getCubeAtPosition(position);

    // Only add if it doesn't exist
    if (!exists) {
      const newCube: Cube = {
        position: {
          x: position.x,
          y: position.y,
          z: position.z,
        },
        playerId: localPlayer.name,
        playerName: localPlayer.name,
      };

      console.log("Adding cube:", newCube);
      // Update local state
      set((state) => ({
        cubes: [...state.cubes, newCube],
      }));

      // Ensure socket is connected before emitting
      ensureSocketConnected()
        .then(() => {
          // Use the addCube service function
          addCubeService(
            {
              x: position.x,
              y: position.y,
              z: position.z,
            },
            localPlayer.name
          );
        })
        .catch((error) => {
          console.error("Failed to connect socket for cube:add:", error);
        });
    }
  },

  removeCube: (position) => {
    const localPlayer = usePlayerStore.getState().getLocalPlayer();
    const canModifyCubes = useGameStateStore.getState().canModifyCubes();

    // Don't proceed if player isn't initialized
    if (!localPlayer) {
      console.warn("Cannot remove cube: Local player not initialized");
      return;
    }

    // Check if game is in active state
    if (!canModifyCubes) {
      console.warn("Cannot remove cube: Game is not active");
      return;
    }

    // Find the cube at this position
    const cube = get().getCubeAtPosition(position);

    // Only remove if it exists and belongs to the local player
    if (cube && cube.playerId === localPlayer.name) {
      console.log("Removing cube at position:", position);
      // Update local state
      set((state) => ({
        cubes: state.cubes.filter(
          (c) =>
            c.position.x !== position.x ||
            c.position.y !== position.y ||
            c.position.z !== position.z
        ),
      }));

      console.log("Now trying to emit cube removal to server");
      // Ensure socket is connected before emitting
      ensureSocketConnected()
        .then(() => {
          // Use the removeCube service function
          removeCubeService({
            x: position.x,
            y: position.y,
            z: position.z,
          });
        })
        .catch((error) => {
          console.error("Failed to connect socket for cube:remove:", error);
        });
    } else {
      console.warn(
        "Cannot remove cube: Either it doesn't exist or doesn't belong to local player"
      );
    }
  },

  syncCubes: (cubes) => {
    set({ cubes });
  },

  hasReachedLimit: () => {
    const state = get();
    const localPlayer = usePlayerStore.getState().getLocalPlayer();

    if (!localPlayer) return true;

    // Use player name as ID
    const playerCubes = state.getCubesByPlayer(localPlayer.name);
    return playerCubes.length >= state.maxCubesPerPlayer;
  },

  getCubesByPlayer: (playerId) => {
    return get().cubes.filter((cube) => cube.playerId === playerId);
  },

  getCubeAtPosition: (position) => {
    // Use a small epsilon for floating point comparison
    const epsilon = 0.1;

    return get().cubes.find(
      (cube) =>
        Math.abs(cube.position.x - position.x) < epsilon &&
        Math.abs(cube.position.y - position.y) < epsilon &&
        Math.abs(cube.position.z - position.z) < epsilon
    );
  },
}));

// Set up socket event listeners for cube state synchronization
export const initializeCubeSocketListeners = () => {
  // Listen for state sync events
  onStateSync((state) => {
    useCubeStore.getState().syncCubes(state.cubes);
  });

  // Listen for cube:add events
  onCubeAdd((cube) => {
    // Only add if it doesn't already exist
    const exists = useCubeStore
      .getState()
      .getCubeAtPosition(
        new THREE.Vector3(cube.position.x, cube.position.y, cube.position.z)
      );

    if (!exists) {
      useCubeStore
        .getState()
        .syncCubes([...useCubeStore.getState().cubes, cube]);
    }
  });

  // Listen for cube:remove events
  onCubeRemove((data) => {
    const { position } = data;

    useCubeStore
      .getState()
      .syncCubes(
        useCubeStore
          .getState()
          .cubes.filter(
            (c) =>
              c.position.x !== position.x ||
              c.position.y !== position.y ||
              c.position.z !== position.z
          )
      );
  });

  // Listen for cubes:reset events
  onCubesReset(() => {
    console.log("Received cubes:reset event");
    useCubeStore.getState().syncCubes([]);
  });
};
