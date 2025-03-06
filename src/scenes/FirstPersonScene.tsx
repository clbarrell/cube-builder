import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import MainScene from "./MainScene";
import ControlsHelp from "../components/UI/ControlsHelp";
import Crosshair from "../components/UI/Crosshair";
import CubeCounter from "../components/UI/CubeCounter";
import PlayerNameInput from "../components/UI/PlayerNameInput";
import { usePlayerStore } from "../game/state/PlayerState";
import { Vector3, PCFSoftShadowMap } from "three";
import ErrorBoundary from "../components/ErrorBoundary";
import { getSocket } from "../services/socketService";
import CursorDebug from "../components/UI/CursorDebug";
import { useDebugStore } from "../game/state/DebugState";
import { useShallow } from "zustand/react/shallow";
import PositionBar from "../components/UI/PositionBar";
import ServerCommandBar from "../components/UI/ServerCommandBar";

const CanvasFallback = () => (
  <div className="w-full h-full flex items-center justify-center bg-gray-800">
    <div className="text-white text-center p-4">
      <h2 className="text-xl font-bold mb-2">3D Rendering Error</h2>
      <p>There was a problem with the 3D scene.</p>
      <button
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => window.location.reload()}
      >
        Reload Page
      </button>
    </div>
  </div>
);

const FirstPersonScene: React.FC = () => {
  const cleanup = usePlayerStore.getState().cleanup;
  const initialize = usePlayerStore.getState().initialize;
  const joinGame = usePlayerStore.getState().joinGame;
  const setLocalPlayer = usePlayerStore.getState().setLocalPlayer;
  const [isInitialized, setIsInitialized] = useState(false);
  const debugModeEnabled = useDebugStore((state) => state.debugModeEnabled);
  const toggleDebugMode = useDebugStore.getState().toggleDebugMode;

  // Memoize the default position to prevent recreation on every render
  const defaultPosition = useMemo(() => new Vector3(0, 2, 5), []);

  // Get debug data from the store
  const debugData = useDebugStore(
    useShallow((state) => ({
      cursorPosition: state.cursorPosition,
      previewPosition: state.previewPosition,
      isValidPlacement: state.isValidPlacement,
      isRemovalMode: state.isRemovalMode,
      hoverRemovableCube: state.hoverRemovableCube,
      placementPosition: state.placementPosition,
    }))
  );

  // Initialize socket connection only once
  useEffect(() => {
    // Initialize socket connection
    initialize();
    setIsInitialized(true);

    // Clean up socket connection when component unmounts
    return () => {
      cleanup();
    };
  }, [initialize, cleanup]);

  // Add keyboard shortcut for toggling debug mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle debug mode with - key
      if (e.key === "-") {
        toggleDebugMode();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Memoize the name submission handler to prevent unnecessary re-renders
  const handleNameSubmit = useCallback(
    async (name: string) => {
      if (!name.trim() || !isInitialized) return;

      try {
        // Join the game with name and default position
        const success = await joinGame(name, defaultPosition);
        console.log("You joined the game.");
        if (!success) {
          console.error("Failed to join game - please try again");
          return;
        }

        // Set local player ID - get socket after successful join
        const socket = getSocket();
        if (socket?.id) {
          console.log("Socket connected. Setting local player.");
          setLocalPlayer(socket.id, name);
        } else {
          // Use non-error logging since this will be retried automatically
          console.log("Waiting for socket connection...");

          // Try again in a moment to get the socket ID
          setTimeout(() => {
            const retrySocket = getSocket();
            if (retrySocket?.id) {
              setLocalPlayer(retrySocket.id, name);
            } else {
              console.error("Socket connection failed after retry");
            }
          }, 500);
        }
      } catch (error) {
        console.error("Error joining game:", error);
      }
    },
    [joinGame, setLocalPlayer, defaultPosition, isInitialized]
  );

  return (
    <div className="w-full h-full">
      <ErrorBoundary fallback={<CanvasFallback />}>
        <Canvas
          shadows={{ type: PCFSoftShadowMap }}
          camera={{ fov: 75, position: [0, 2, 5] }}
        >
          <MainScene />
        </Canvas>
      </ErrorBoundary>
      {/* NON-3D UI */}
      <ControlsHelp />
      <Crosshair />
      <CubeCounter />
      <PlayerNameInput onNameSubmit={handleNameSubmit} />
      <PositionBar />
      {/* Show cursor debug UI if debug mode is on */}
      {debugModeEnabled && <CursorDebug {...debugData} />}

      {/* Debug toggle indicator */}
      {debugModeEnabled && <ServerCommandBar />}
    </div>
  );
};

export default FirstPersonScene;
