import React from "react";

const Lighting: React.FC = () => {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[13, 13, 15]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-camera-near={0.5}
        shadow-camera-far={50}
      />
    </>
  );
};

export default Lighting;
