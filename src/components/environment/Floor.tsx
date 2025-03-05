import React from "react";
import { Text } from "@react-three/drei";

const Floor: React.FC = () => {
  const floorSizeWidth = 50;
  const floorSizeHeight = 50;

  // Generate coordinate labels
  const coordinateLabels = [];
  const step = 5; // Place a label every 5 units
  const fontSize = 0.3;
  const labelHeight = 0.02; // Slightly above the floor

  // Create X-axis labels
  for (let x = -floorSizeWidth / 2; x <= floorSizeWidth / 2; x += step) {
    if (x === 0) continue; // Skip zero for cleaner look
    coordinateLabels.push(
      <Text
        key={`x-${x}`}
        position={[x, labelHeight, 0.25]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={fontSize}
        color="#525252"
        anchorX="center"
        anchorY="middle"
        renderOrder={1}
      >
        {x}
      </Text>
    );
  }

  // Create Z-axis labels
  for (let z = -floorSizeHeight / 2; z <= floorSizeHeight / 2; z += step) {
    if (z === 0) continue; // Skip zero for cleaner look
    coordinateLabels.push(
      <Text
        key={`z-${z}`}
        position={[0.25, labelHeight, z]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={fontSize}
        color="#525252"
        anchorX="center"
        anchorY="middle"
        renderOrder={1}
      >
        {z}
      </Text>
    );
  }
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[floorSizeWidth, floorSizeHeight]} />
        <meshStandardMaterial
          color="#4a6741" // Grass green color
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      <gridHelper
        args={[floorSizeWidth, floorSizeHeight, "#888888", "#444444"]}
        position={[0, 0.01, 0]}
        rotation={[0, 0, 0]}
      />
      {coordinateLabels}
    </>
  );
};

export default Floor;
