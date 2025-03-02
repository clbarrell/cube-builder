import React from "react";
import { useCubeStore } from "../../game/state/CubeState";

const CubeCounter: React.FC = () => {
  const cubes = useCubeStore((state) => state.cubes);
  const maxCubes = useCubeStore((state) => state.maxCubes);
  const hasReachedLimit = useCubeStore((state) => state.hasReachedLimit());

  return (
    <div className="absolute text-right top-0 right-0 bg-black/70 text-white px-4 py-2 rounded-bl-md">
      <div className="text-sm font-medium flex items-center gap-2">
        {hasReachedLimit && (
          <div className="text-red-400">No more cubes left</div>
        )}
        <div>🟩</div>
        <span className={`${hasReachedLimit ? "text-red-400" : "text-white"}`}>
          {cubes.length} / {maxCubes}
        </span>
      </div>
    </div>
  );
};

export default CubeCounter;
