import React from "react";

const ControlsHelp: React.FC = () => {
  return (
    <div className="fixed top-0 left-0 p-4 text-white bg-black/80">
      <p>WASD/Arrow Keys: Move</p>
      <p>Mouse: Look around</p>
      <p>Space: Move up</p>
      <p>Shift: Move down</p>
      <p>Click to enable controls.</p>
      <p>Esc to exit.</p>
    </div>
  );
};

export default ControlsHelp;
