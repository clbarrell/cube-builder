import React from "react";
import { useCubeStore } from "../../game/state/CubeState";

const Crosshair: React.FC = () => {
  const hasReachedLimit = useCubeStore((state) => state.hasReachedLimit());

  return (
    <div className="fixed inset-0 flex items-center transition-all duration-300 justify-center pointer-events-none">
      <div
        className={`relative w-5 h-5 ${
          hasReachedLimit && "transform rotate-45"
        }`}
      >
        {/* Horizontal line */}
        <div
          className={`absolute top-1/2 left-0 w-full h-0.5 opacity-50 -translate-y-1/2 ${
            hasReachedLimit ? "bg-red-400" : "bg-white"
          }`}
        ></div>
        {/* Vertical line */}
        <div
          className={`absolute top-0 left-1/2 h-full w-0.5  opacity-50 -translate-x-1/2 ${
            hasReachedLimit ? "bg-red-400" : "bg-white"
          }`}
        ></div>
      </div>
    </div>
  );
};

export default Crosshair;
