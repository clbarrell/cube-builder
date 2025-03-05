import React from "react";
import { usePlayerStore } from "../../game/state/PlayerState";
import { UsersRound } from "lucide-react";

const ControlsHelp: React.FC = () => {
  const count = usePlayerStore((state) => state.count);

  return (
    <div className="fixed top-0 left-0 select-none bg-black/70 text-white py-2 px-3 font-mono text-xs rounded-br-md flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium flex items-center gap-2">
          <div>
            <UsersRound />
          </div>
          <span>
            {count} {count === 1 ? "player" : "players"} online
          </span>
        </div>
      </div>
      <div>
        <p>WASD/Arrow Keys: Move</p>
        <p>Mouse: Look around</p>
        <p>Space: Move up</p>
        <p>Shift: Move down</p>
        <p>Click: Place cube</p>
        <p>Ctrl+Click: Remove cube</p>
        <p>Esc: exit cursor</p>
      </div>
    </div>
  );
};

export default ControlsHelp;
