import React from "react";
import { useCubeStore } from "../../game/state/CubeState";
import { usePlayerStore } from "../../game/state/PlayerState";
import { SquareMousePointer, SquareDashedMousePointer } from "lucide-react";

const CubeCounter: React.FC = () => {
  const maxCubes = useCubeStore((state) => state.maxCubesPerPlayer);
  const hasReachedLimit = useCubeStore((state) => state.hasReachedLimit());
  const getCubesByPlayer = useCubeStore((state) => state.getCubesByPlayer);
  const localPlayer = usePlayerStore((state) => state.getLocalPlayer());

  // Get only the local player's cubes
  const localPlayerCubes = localPlayer ? getCubesByPlayer(localPlayer.id) : [];

  return (
    <div className="absolute text-right top-0 right-0 bg-black/70 text-white px-4 py-1 rounded-bl-md">
      <div
        className={`text-xs font-medium font-mono flex items-center gap-2 ${
          hasReachedLimit ? "text-red-400" : "text-white"
        }`}
      >
        {hasReachedLimit && <div>No more cubes left</div>}
        <div>
          {hasReachedLimit ? (
            <SquareDashedMousePointer className="w-4 h-4" strokeWidth={2.5} />
          ) : (
            <SquareMousePointer className="w-4 h-4" strokeWidth={2.5} />
          )}
        </div>
        <span>
          {localPlayerCubes.length} / {maxCubes}
        </span>
      </div>
    </div>
  );
};

export default CubeCounter;
