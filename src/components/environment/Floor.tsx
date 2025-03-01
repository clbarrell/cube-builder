import React from "react";

const Floor: React.FC = () => {
  const floorSizeWidth = 50;
  const floorSizeHeight = 50;
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[floorSizeWidth, floorSizeHeight]} />
        <meshStandardMaterial color="#555555" />
      </mesh>
      <gridHelper
        args={[floorSizeWidth, floorSizeHeight, "#888888", "#444444"]}
        position={[0, 0.01, 0]}
        rotation={[0, 0, 0]}
      />
    </>
  );
};

export default Floor;
