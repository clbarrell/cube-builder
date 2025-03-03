import React from "react";
import { usePlayerStore } from "../../game/state/PlayerState";
import { useShallow } from "zustand/react/shallow";

const ControlsHelp: React.FC = () => {
  const count = usePlayerStore((state) => state.count);
  const playerNames = usePlayerStore(
    useShallow((state) => state.getPlayerNames())
  );
  return (
    <div className="fixed top-0 left-0 px-4 py-2 text-sm select-none text-white bg-black/70 rounded-br-lg flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium flex items-center gap-2">
          <div>👤</div>
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
        <p>Esc: exit cursor</p>
      </div>
      <div>{playerNames.join(", ")}</div>
    </div>
  );
};

export default ControlsHelp;
