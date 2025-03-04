import React from "react";
import { useCubeStore } from "../../game/state/CubeState";
import { usePlayerStore } from "../../game/state/PlayerState";

const CubeCounter: React.FC = () => {
  const maxCubes = useCubeStore((state) => state.maxCubesPerPlayer);
  const hasReachedLimit = useCubeStore((state) => state.hasReachedLimit());
  const getCubesByPlayer = useCubeStore((state) => state.getCubesByPlayer);
  const localPlayer = usePlayerStore((state) => state.getLocalPlayer());

  // Get only the local player's cubes
  const localPlayerCubes = localPlayer ? getCubesByPlayer(localPlayer.id) : [];

  return (
    <div className="absolute text-right top-0 right-0 bg-black/70 text-white px-4 py-2 rounded-bl-md">
      <div className="text-sm font-medium flex items-center gap-2">
        {hasReachedLimit && (
          <div className="text-red-400">No more cubes left</div>
        )}
        <div>🟩</div>
        <span className={`${hasReachedLimit ? "text-red-400" : "text-white"}`}>
          {localPlayerCubes.length} / {maxCubes}
        </span>
      </div>
    </div>
  );
};

export default CubeCounter;
