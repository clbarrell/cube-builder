import React from "react";
import { useCubeStore } from "../../game/state/CubeState";
import Cube from "./Cube";

const Cubes: React.FC = () => {
  const cubes = useCubeStore((state) => state.cubes);

  return (
    <>
      {cubes.map((position, index) => (
        <Cube key={`cube-${index}`} position={position} />
      ))}
    </>
  );
};

export default Cubes;
