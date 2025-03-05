import { Sky } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect } from "react";

interface ProceduralSkyProps {
  /** Sun position as [x, y, z] */
  sunPosition?: [number, number, number];

  /** Turbidity - amount of haze (2-21) */
  turbidity?: number;

  /** Rayleigh scattering value (0-4) */
  rayleigh?: number;

  /** Mie directional scattering value (0-1) */
  mieDirectionalG?: number;

  /** Mie coefficient (0-0.1) */
  mieCoefficient?: number;
}

/**
 * A procedural sky component that creates a realistic sky with sun
 * Uses @react-three/drei's Sky component
 */
const ProceduralSky: React.FC<ProceduralSkyProps> = ({
  sunPosition = [10, 20, 15],
  turbidity = 10,
  rayleigh = 0.5,
  mieDirectionalG = 0.8,
  mieCoefficient = 0.005,
}) => {
  const { scene } = useThree();

  // Clear any existing background color
  useEffect(() => {
    const originalBackground = scene.background;
    scene.background = null;

    return () => {
      scene.background = originalBackground;
    };
  }, [scene]);

  return (
    <Sky
      distance={450000}
      sunPosition={sunPosition}
      turbidity={turbidity}
      rayleigh={rayleigh}
      mieDirectionalG={mieDirectionalG}
      mieCoefficient={mieCoefficient}
      inclination={0.49}
      azimuth={0.25}
    />
  );
};

export default ProceduralSky;
