import React from "react";
import { Text } from "@react-three/drei";
import * as THREE from "three";

export const floorSizeWidth = 60;
export const floorSizeHeight = 60;

// River configuration
export const riverWidth = 10; // +/- 5 on X axis
export const riverDepth = 1; // How much lower the river is compared to land
export const landHeight = 0; // Default land height

// Export river bottom position for collision detection
export const riverBottomY = landHeight - riverDepth;

const Floor: React.FC = () => {
  // Generate coordinate labels
  const coordinateLabels = [];
  const step = 5; // Place a label every 5 units
  const fontSize = 0.3;
  const labelHeight = landHeight + 0.02; // Slightly above the land

  // Create X-axis labels
  // for (let x = -floorSizeWidth / 2; x <= floorSizeWidth / 2; x += step) {
  //   if (x === 0) continue; // Skip zero for cleaner look
  //   coordinateLabels.push(
  //     <Text
  //       key={`x-${x}`}
  //       position={[
  //         x,
  //         (Math.abs(x) <= riverWidth / 2 ? -riverDepth : landHeight) +
  //           labelHeight,
  //         0.25,
  //       ]}
  //       rotation={[-Math.PI / 2, 0, 0]}
  //       fontSize={fontSize}
  //       color="#525252"
  //       anchorX="center"
  //       anchorY="middle"
  //       renderOrder={1}
  //     >
  //       {x}
  //     </Text>
  //   );
  // }

  // Create Z-axis labels
  for (let z = -floorSizeHeight / 2; z <= floorSizeHeight / 2; z += step) {
    coordinateLabels.push(
      <Text
        key={`z-${z}`}
        position={[riverWidth / 2 + 0.45, labelHeight, z]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={fontSize}
        color="#525252"
        anchorX="center"
        anchorY="middle"
        renderOrder={1}
      >
        {z}
      </Text>,
      <Text
        key={`z-${z}`}
        position={[-riverWidth / 2 - 0.45, labelHeight, z]}
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

  // Calculate land dimensions (on either side of the river)
  const landWidth = (floorSizeWidth - riverWidth) / 2;

  // Create custom grid helper only for land areas
  const createLandGrid = (xOffset: number) => {
    const gridSize = landWidth;
    const divisions = Math.floor(landWidth / 1); // One division per unit

    const gridGeometry = new THREE.BufferGeometry();
    const gridMaterial = new THREE.LineBasicMaterial({
      color: "#666666",
      transparent: true,
      opacity: 0.4,
    });

    const vertices = [];

    // Create grid lines parallel to z-axis
    for (let i = 0; i <= divisions; i++) {
      const x = (i / divisions) * gridSize - gridSize / 2;
      vertices.push(x + xOffset, 0, -floorSizeHeight / 2);
      vertices.push(x + xOffset, 0, floorSizeHeight / 2);
    }

    // Create grid lines parallel to x-axis
    for (let i = 0; i <= floorSizeHeight; i++) {
      const z = (i / floorSizeHeight) * floorSizeHeight - floorSizeHeight / 2;
      vertices.push(xOffset - gridSize / 2, 0, z);
      vertices.push(xOffset + gridSize / 2, 0, z);
    }

    gridGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3)
    );

    return <lineSegments geometry={gridGeometry} material={gridMaterial} />;
  };

  return (
    <>
      {/* Left land */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[-riverWidth / 2 - landWidth / 2, landHeight, 0]}
        receiveShadow
      >
        <planeGeometry args={[landWidth, floorSizeHeight]} />
        <meshStandardMaterial
          color="#4a6741" // Grass green color
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Right land */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[riverWidth / 2 + landWidth / 2, landHeight, 0]}
        receiveShadow
      >
        <planeGeometry args={[landWidth, floorSizeHeight]} />
        <meshStandardMaterial
          color="#4a6741" // Grass green color
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* River */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -riverDepth, 0]}
        receiveShadow
      >
        <planeGeometry args={[riverWidth, floorSizeHeight]} />
        <meshStandardMaterial
          color="#2a5b8a" // Blue water color
          roughness={0.1}
          metalness={0.2}
        />
      </mesh>

      {/* Grid helpers only on land */}
      <group position={[0, landHeight + 0.01, 0]}>
        {/* Left land grid */}
        {createLandGrid(-riverWidth / 2 - landWidth / 2)}

        {/* Right land grid */}
        {createLandGrid(riverWidth / 2 + landWidth / 2)}
      </group>

      {coordinateLabels}
    </>
  );
};

export default Floor;
