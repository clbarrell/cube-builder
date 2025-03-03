import React, { useMemo } from "react";
import { Text } from "@react-three/drei";
import { usePlayerStore } from "../../game/state/PlayerState";
import { Vector3, Euler } from "three";
import { useShallow } from "zustand/shallow";
import { useFrame } from "@react-three/fiber";

// Component to render a single player
const PlayerAvatar: React.FC<{
  id: string;
  name: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number };
}> = ({ name, position, rotation }) => {
  // Memoize the player visualization to prevent unnecessary re-renders
  const playerPosition = useMemo(
    () => new Vector3(position.x, position.y, position.z),
    [position.x, position.y, position.z]
  );
  const playerRotation = useMemo(
    () => new Euler(0, rotation.y, 0),
    [rotation.y]
  );
  // Reference to the text element to update its rotation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const textRef = React.useRef<any>(null);

  // Update text rotation every frame to face the camera
  useFrame(({ camera }) => {
    if (textRef.current) {
      // Make the text look at the camera
      textRef.current.lookAt(camera.position);
    }
  });

  return (
    <group position={playerPosition}>
      {/* Player cylinder */}
      <mesh castShadow receiveShadow rotation={playerRotation}>
        <cylinderGeometry args={[0.3, 0.3, 1.8, 16]} />
        <meshStandardMaterial color="royalblue" />
      </mesh>

      {/* Player name - now with ref and no rotation inheritance */}
      <Text
        ref={textRef}
        position={[0, 1.5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#000000"
        // Remove rotation inheritance from parent
        rotation={[0, 0, 0]}
      >
        {name}
      </Text>
    </group>
  );
};

// Component to render all other players
const PlayerVisualization: React.FC = () => {
  // Fix: Use a stable selector function
  const otherPlayers = usePlayerStore(
    useShallow((state) =>
      Object.values(state.players).filter(
        (player) => player.id !== state.localPlayerId
      )
    )
  );
  console.log("Other players", otherPlayers);

  // Memoize the player list to prevent unnecessary re-renders
  const playerElements = useMemo(() => {
    return otherPlayers.map((player) => (
      <PlayerAvatar
        key={player.id}
        id={player.id}
        name={player.name}
        position={player.position}
        rotation={player.rotation}
      />
    ));
  }, [otherPlayers]);

  return <>{playerElements}</>;
};

export default PlayerVisualization;
