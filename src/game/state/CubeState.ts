import { create } from "zustand";
import * as THREE from "three";
import {
  Cube,
  safeEmit,
  onStateSync,
  onCubeAdd,
  onCubeRemove,
  ensureSocketConnected,
} from "../../services/socketService";
import { usePlayerStore } from "./PlayerState";

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

export const useCubeStore = create<CubeState>((set, get) => ({
  cubes: [],
  maxCubesPerPlayer: 25,

  addCube: (position) => {
    const localPlayer = usePlayerStore.getState().getLocalPlayer();

    // Don't proceed if player isn't initialized
    if (!localPlayer) {
      console.warn("Cannot add cube: Local player not initialized");
      return;
    }

    // Check if we've reached the maximum number of cubes for this player
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
        playerId: localPlayer.id,
        playerName: localPlayer.name,
      };

      console.log("Adding cube:", newCube);
      // Update local state
      set((state) => ({
        cubes: [...state.cubes, newCube],
      }));

      console.log("Now trying to emit cube to server");
      // Ensure socket is connected before emitting
      ensureSocketConnected()
        .then(() => {
          // Emit to server
          safeEmit("cube:add", newCube as unknown as Record<string, unknown>);
        })
        .catch((error) => {
          console.error("Failed to connect socket for cube:add:", error);
        });
    }
  },

  removeCube: (position) => {
    const localPlayer = usePlayerStore.getState().getLocalPlayer();

    // Don't proceed if player isn't initialized
    if (!localPlayer) {
      console.warn("Cannot remove cube: Local player not initialized");
      return;
    }

    // Find the cube at this position
    const cube = get().getCubeAtPosition(position);

    // Only remove if it exists and belongs to the local player
    if (cube && cube.playerId === localPlayer.id) {
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
          // Emit to server
          safeEmit("cube:remove", {
            position: {
              x: position.x,
              y: position.y,
              z: position.z,
            },
            playerId: localPlayer.id,
          } as unknown as Record<string, unknown>);
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

    const playerCubes = state.getCubesByPlayer(localPlayer.id);
    return playerCubes.length >= state.maxCubesPerPlayer;
  },

  getCubesByPlayer: (playerId) => {
    return get().cubes.filter((cube) => cube.playerId === playerId);
  },

  getCubeAtPosition: (position) => {
    return get().cubes.find(
      (cube) =>
        cube.position.x === position.x &&
        cube.position.y === position.y &&
        cube.position.z === position.z
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
};
