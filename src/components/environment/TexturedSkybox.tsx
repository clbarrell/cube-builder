import { useThree } from "@react-three/fiber";
import { BackSide, Color, CubeTextureLoader } from "three";
import { useEffect, useState } from "react";

interface TexturedSkyboxProps {
  /**
   * URLs to the six skybox textures in order:
   * [posx, negx, posy, negy, posz, negz]
   * If not provided, will use a simple color skybox
   */
  urls?: [string, string, string, string, string, string];

  /** Fallback color if textures fail to load */
  fallbackColor?: string;
}

/**
 * A skybox component that can use cube textures for a more realistic sky
 * Falls back to a simple color skybox if textures aren't provided
 */
const TexturedSkybox: React.FC<TexturedSkyboxProps> = ({
  urls,
  fallbackColor = "#87CEEB", // Default sky blue
}) => {
  const { scene } = useThree();
  const [texturesLoaded, setTexturesLoaded] = useState(false);

  // Load textures if provided
  useEffect(() => {
    // Save the original background
    const originalBackground = scene.background;

    // If we have texture URLs, try to load them
    if (urls && urls.length === 6) {
      const loader = new CubeTextureLoader();

      loader.load(
        urls,
        // onLoad callback
        (textureCube) => {
          scene.background = textureCube;
          setTexturesLoaded(true);
        },
        // onProgress callback
        undefined,
        // onError callback
        (err) => {
          console.error("Error loading skybox textures:", err);
          scene.background = new Color(fallbackColor);
        }
      );
    } else {
      // No textures provided, use fallback color
      scene.background = new Color(fallbackColor);
    }

    // Clean up when component unmounts
    return () => {
      scene.background = originalBackground;
    };
  }, [scene, urls, fallbackColor]);

  // If textures are loaded, we don't need to render a sphere
  if (texturesLoaded) return null;

  // Fallback sphere skybox (only used when no textures or textures failed to load)
  return (
    <mesh>
      <sphereGeometry args={[500, 60, 40]} />
      <meshBasicMaterial color={fallbackColor} side={BackSide} fog={false} />
    </mesh>
  );
};

export default TexturedSkybox;
