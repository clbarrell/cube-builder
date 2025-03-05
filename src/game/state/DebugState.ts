import { create } from "zustand";
import * as THREE from "three";

export interface DebugState {
  cursorPosition: THREE.Vector3 | null;
  previewPosition: THREE.Vector3 | null;
  placementPosition: THREE.Vector3 | null;
  isValidPlacement: boolean;
  isRemovalMode: boolean;
  hoverRemovableCube: THREE.Vector3 | null;
  debugModeEnabled: boolean;

  // Actions
  updateCursorDebug: (data: {
    cursorPosition: THREE.Vector3 | null;
    previewPosition: THREE.Vector3 | null;
    placementPosition: THREE.Vector3 | null;
    isValidPlacement: boolean;
    isRemovalMode: boolean;
    hoverRemovableCube: THREE.Vector3 | null;
  }) => void;

  toggleDebugMode: () => void;
}

export const useDebugStore = create<DebugState>()((set, get) => ({
  cursorPosition: null,
  previewPosition: null,
  placementPosition: null,
  isValidPlacement: false,
  isRemovalMode: false,
  hoverRemovableCube: null,
  debugModeEnabled: false,
  updateCursorDebug: (data) => set((state) => ({ ...state, ...data })),
  toggleDebugMode: () => {
    const newValue = !get().debugModeEnabled;
    set({ debugModeEnabled: newValue });
    console.log("Debug mode toggled to:", newValue);
    return newValue;
  },
}));
