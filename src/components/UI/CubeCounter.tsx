import React from "react";
import { useCubeStore } from "../../game/state/CubeState";

const CubeCounter: React.FC = () => {
  const cubes = useCubeStore((state) => state.cubes);
  const maxCubes = useCubeStore((state) => state.maxCubes);
  const hasReachedLimit = useCubeStore((state) => state.hasReachedLimit());

  return (
    <div className="absolute top-0 right-0 bg-black/70 text-white px-4 py-2 rounded-bl-md">
      <div className="text-lg font-medium">
        Cubes: {cubes.length} / {maxCubes}
      </div>
      {hasReachedLimit && (
        <div className="text-red-400 text-sm">Maximum limit reached!</div>
      )}
    </div>
  );
};

export default CubeCounter;
