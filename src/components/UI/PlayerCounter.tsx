import React from "react";
import { usePlayerStore } from "../../game/state/PlayerState";

const PlayerCounter: React.FC = () => {
  const count = usePlayerStore((state) => state.count);
  const localPlayerName = usePlayerStore((state) => state.localPlayerName);

  return (
    <div className="absolute text-left top-0 left-0 bg-black/70 text-white px-4 py-2 rounded-br-md">
      <div className="text-sm font-medium flex items-center gap-2">
        <div>👤</div>
        <span>
          {count} {count === 1 ? "player" : "players"} online
        </span>
        {localPlayerName && (
          <span className="text-blue-400 ml-2">(You: {localPlayerName})</span>
        )}
      </div>
    </div>
  );
};

export default PlayerCounter;
