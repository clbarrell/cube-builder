import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import MainScene from "./MainScene";
import ControlsHelp from "../components/UI/ControlsHelp";
import Crosshair from "../components/UI/Crosshair";
import CubeCounter from "../components/UI/CubeCounter";
import PlayerNameInput from "../components/UI/PlayerNameInput";
import { usePlayerStore } from "../game/state/PlayerState";
import { Vector3 } from "three";
import ErrorBoundary from "../components/ErrorBoundary";
import { getSocket } from "../services/socketService";

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
  const cleanup = usePlayerStore((state) => state.cleanup);
  const initialize = usePlayerStore((state) => state.initialize);
  const joinGame = usePlayerStore((state) => state.joinGame);
  const setLocalPlayer = usePlayerStore((state) => state.setLocalPlayer);
  const [isInitialized, setIsInitialized] = useState(false);

  // Memoize the default position to prevent recreation on every render
  const defaultPosition = useMemo(() => new Vector3(0, 2, 5), []);

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
        <Canvas shadows camera={{ fov: 75, position: [0, 2, 5] }}>
          <MainScene />
        </Canvas>
      </ErrorBoundary>
      <ControlsHelp />
      <Crosshair />
      <CubeCounter />
      <PlayerNameInput onNameSubmit={handleNameSubmit} />
    </div>
  );
};

export default FirstPersonScene;
