import { useThree } from "@react-three/fiber";
import { BackSide, Color } from "three";
import { useEffect } from "react";

/**
 * A simple skybox component that creates a gradient sky background
 * Uses a color for simplicity
 */
const Skybox: React.FC = () => {
  const { scene } = useThree();

  useEffect(() => {
    // Save the original background
    const originalBackground = scene.background;

    // Set a nice blue gradient background
    scene.background = new Color("#87CEEB");
    scene.fog = null;

    // Clean up when component unmounts
    return () => {
      scene.background = originalBackground;
    };
  }, [scene]);

  return (
    <mesh>
      {/* Sky sphere */}
      <sphereGeometry args={[500, 60, 40]} />
      <meshBasicMaterial
        color="#4287f5" // Sky blue
        side={BackSide} // BackSide to render inside of sphere
        fog={false}
      />
    </mesh>
  );
};

export default Skybox;
