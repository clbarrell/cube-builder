import React, { useMemo } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import { usePlayerStore } from "../../game/state/PlayerState";
import { getPlayerColor } from "../../utils/colours";

interface CubeProps {
  position: THREE.Vector3;
  playerId: string;
  playerName: string;
}

interface TextFaceConfig {
  position: [number, number, number];
  rotation: [number, number, number];
}

const Cube: React.FC<CubeProps> = ({ position, playerId, playerName }) => {
  const localPlayerId = usePlayerStore((state) => state.localPlayerId);

  // Determine if this cube belongs to the local player
  const isOwnCube = localPlayerId === playerId;

  // Memoize the color to avoid recalculating on every render
  const color = useMemo(() => getPlayerColor(playerId), [playerId]);

  // Define positions and rotations for text on each face of the cube
  const textConfigurations = useMemo<TextFaceConfig[]>(
    () => [
      // Front face
      { position: [0, 0, 0.501], rotation: [0, 0, 0] },
      // Back face
      { position: [0, 0, -0.501], rotation: [0, Math.PI, 0] },
      // Left face
      { position: [-0.501, 0, 0], rotation: [0, -Math.PI / 2, 0] },
      // Right face
      { position: [0.501, 0, 0], rotation: [0, Math.PI / 2, 0] },
      // Top face
      { position: [0, 0.501, 0], rotation: [-Math.PI / 2, 0, 0] },
      // Bottom face
      { position: [0, -0.501, 0], rotation: [Math.PI / 2, 0, 0] },
    ],
    []
  );

  return (
    <group position={[position.x, position.y, position.z]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={color}
          emissive={isOwnCube ? color : undefined}
          emissiveIntensity={isOwnCube ? 0.2 : 0}
        />
      </mesh>

      {/* Display player name on each face of the cube */}
      {textConfigurations.map((config, index) => (
        <Text
          key={index}
          position={config.position}
          rotation={config.rotation}
          fontSize={0.1}
          color="white"
          anchorX="center"
          anchorY="middle"
          renderOrder={1}
          material-transparent={true}
          material-opacity={0.15}
          maxWidth={0.9}
        >
          {playerName}
        </Text>
      ))}
    </group>
  );
};

export default Cube;
