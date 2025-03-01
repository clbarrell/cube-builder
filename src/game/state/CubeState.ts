import { create } from "zustand";
import * as THREE from "three";

interface CubeState {
  cubes: THREE.Vector3[];
  addCube: (position: THREE.Vector3) => void;
}

export const useCubeStore = create<CubeState>((set) => ({
  cubes: [],
  addCube: (position) =>
    set((state) => {
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
}));
