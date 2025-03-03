import React, { useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { usePlayerStore } from "../../game/state/PlayerState";
import { Vector3 } from "three";

const PlayerPositionSync: React.FC = () => {
  const { camera } = useThree();
  const updatePosition = usePlayerStore((state) => state.updatePosition);
  const localPlayerName = usePlayerStore((state) => state.localPlayerName);

  // Throttling for position updates
  const lastPositionUpdate = useRef(0);
  const positionUpdateInterval = 15; // ms between position updates

  // Store last sent position to avoid unnecessary updates
  const lastPosition = useRef(new Vector3());
  const lastRotation = useRef({ x: 0, y: 0 });

  // Send position updates to server (throttled)
  useFrame(() => {
    // Only sync position if player has joined with a name
    if (!localPlayerName) return;

    const now = Date.now();
    if (now - lastPositionUpdate.current > positionUpdateInterval) {
      const currentPosition = camera.position.clone();

      // Extract rotation from camera - ensure we're getting the correct values
      const currentRotation = {
        x: camera.rotation.x,
        y: camera.rotation.y,
      };

      // Check if position or rotation has changed significantly
      const positionChanged =
        Math.abs(currentPosition.x - lastPosition.current.x) > 0.01 ||
        Math.abs(currentPosition.y - lastPosition.current.y) > 0.01 ||
        Math.abs(currentPosition.z - lastPosition.current.z) > 0.01;

      const rotationChanged =
        Math.abs(currentRotation.x - lastRotation.current.x) > 0.01 ||
        Math.abs(currentRotation.y - lastRotation.current.y) > 0.01;

      // Only update if there's a meaningful change
      if (positionChanged || rotationChanged) {
        updatePosition(currentPosition, currentRotation);

        // Update last sent values
        lastPosition.current.copy(currentPosition);
        lastRotation.current = { ...currentRotation };
        lastPositionUpdate.current = now;
      }
    }
  });

  return null;
};

export default PlayerPositionSync;
