import React from "react";
import { useRef } from "react";
import * as THREE from "three";

const Lighting: React.FC = () => {
  // Reference to the directional light for shadows
  const directionalLightRef = useRef<THREE.DirectionalLight>(null);

  // Uncomment to debug shadow camera
  // useHelper(directionalLightRef, THREE.DirectionalLightHelper, 5);
  // useHelper(directionalLightRef, THREE.CameraHelper);

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight
        ref={directionalLightRef}
        position={[10, 20, 15]} // Position for good shadows
        intensity={1.2}
        castShadow
        shadow-bias={-0.0005} // Reduce shadow acne
        shadow-normalBias={0.04} // Improve shadow edge quality
        shadow-mapSize={[2048, 2048]} // Higher resolution shadows
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-camera-near={0.5}
        shadow-camera-far={50}
      />
      <hemisphereLight args={["#87CEEB", "#382b2b", 0.3]} />
    </>
  );
};

export default Lighting;
