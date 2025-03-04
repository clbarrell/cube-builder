import React, { useMemo } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import { usePlayerStore } from "../../game/state/PlayerState";

interface CubeProps {
  position: THREE.Vector3;
  playerId: string;
  playerName: string;
}

// Generate a consistent color based on player name
const getPlayerColor = (playerId: string): string => {
  // Simple hash function to generate a number from a string
  const hash = playerId.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  // Convert to HSL color with good saturation and lightness
  const h = Math.abs(hash % 360);
  return `hsl(${h}, 70%, 60%)`;
};

const Cube: React.FC<CubeProps> = ({ position, playerId, playerName }) => {
  const localPlayerId = usePlayerStore((state) => state.localPlayerId);

  // Determine if this cube belongs to the local player
  const isOwnCube = localPlayerId === playerId;

  // Memoize the color to avoid recalculating on every render
  const color = useMemo(() => getPlayerColor(playerId), [playerId]);

  return (
    <group>
      <mesh
        position={[position.x, position.y, position.z]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={color}
          emissive={isOwnCube ? color : undefined}
          emissiveIntensity={isOwnCube ? 0.2 : 0}
        />
      </mesh>

      {/* Show player name on hover (would need to implement hover state) */}
      {/* <Text
        position={[position.x, position.y + 0.7, position.z]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
        visible={false} // Only show on hover
      >
        {playerName}
      </Text> */}
    </group>
  );
};

export default Cube;
