import React from "react";

const Floor: React.FC = () => {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#555555" />
      </mesh>
      <gridHelper
        args={[50, 50, "#888888", "#444444"]}
        position={[0, 0.01, 0]}
        rotation={[0, 0, 0]}
      />
    </>
  );
};

export default Floor;
