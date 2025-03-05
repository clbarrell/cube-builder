import React from "react";
import { usePlayerStore } from "../../game/state/PlayerState";

const PositionBar: React.FC = () => {
  const player = usePlayerStore((state) => state.getLocalPlayer());

  // If player doesn't exist yet, show zeros or nothing
  if (!player) {
    return null;
  }

  return (
    <div className="absolute text-left top-0 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-1 rounded-b-md">
      <div className="text-xs font-medium font-mono flex items-center gap-2">
        <div>Your position:</div>
        <div>{player.position.x.toFixed(0)},</div>
        <div>{player.position.z.toFixed(0)}</div>
      </div>
    </div>
  );
};

export default PositionBar;
