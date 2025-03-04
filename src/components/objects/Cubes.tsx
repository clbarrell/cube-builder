import React, { useEffect } from "react";
import {
  useCubeStore,
  initializeCubeSocketListeners,
} from "../../game/state/CubeState";
import Cube from "./Cube";
import * as THREE from "three";

const Cubes: React.FC = () => {
  const cubes = useCubeStore((state) => state.cubes);

  // Initialize cube socket listeners when component mounts
  useEffect(() => {
    initializeCubeSocketListeners();
  }, []);

  return (
    <>
      {cubes.map((cube, index) => (
        <Cube
          key={`cube-${index}-${cube.position.x}-${cube.position.y}-${cube.position.z}`}
          position={
            new THREE.Vector3(cube.position.x, cube.position.y, cube.position.z)
          }
          playerId={cube.playerId}
          playerName={cube.playerName}
        />
      ))}
    </>
  );
};

export default Cubes;
