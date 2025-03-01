import { create } from "zustand";
import * as THREE from "three";

interface CubeState {
  cubes: THREE.Vector3[];
  maxCubes: number;
  addCube: (position: THREE.Vector3) => void;
  hasReachedLimit: () => boolean;
}

export const useCubeStore = create<CubeState>((set, get) => ({
  cubes: [],
  maxCubes: 10,
  addCube: (position) =>
    set((state) => {
      // Check if we've reached the maximum number of cubes
      if (state.cubes.length >= state.maxCubes) {
        return state;
      }

      // Check if a cube already exists at this position
      const exists = state.cubes.some(
        (cube) =>
          cube.x === position.x &&
          cube.y === position.y &&
          cube.z === position.z
      );

      // Only add if it doesn't exist
      if (!exists) {
        return { cubes: [...state.cubes, position.clone()] };
      }
      return state;
    }),
  hasReachedLimit: () => {
    const state = get();
    return state.cubes.length >= state.maxCubes;
  },
}));
