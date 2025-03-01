import React from "react";

const Crosshair: React.FC = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
      <div className="relative w-5 h-5">
        {/* Horizontal line */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white opacity-70 -translate-y-1/2"></div>
        {/* Vertical line */}
        <div className="absolute top-0 left-1/2 h-full w-0.5 bg-white opacity-70 -translate-x-1/2"></div>
      </div>
    </div>
  );
};

export default Crosshair;
