import React from "react";
import * as THREE from "three";

interface CubePositionDebugProps {
  position: THREE.Vector3 | null;
  isValid: boolean;
}

const CubePositionDebug: React.FC<CubePositionDebugProps> = ({
  position,
  isValid,
}) => {
  if (!position) return null;

  return (
    <div className="fixed bottom-4 left-4 bg-black/70 text-white p-3 rounded-md font-mono text-sm z-50">
      <div className="font-bold mb-1">Cube Preview Position</div>
      <div>X: {position.x.toFixed(2)}</div>
      <div>Y: {position.y.toFixed(2)}</div>
      <div>Z: {position.z.toFixed(2)}</div>
      <div className="mt-1">
        Cursor:
        <span className={isValid ? "text-green-400 ml-2" : "text-red-400 ml-2"}>
          {/* put the placement of where the camera is pointed */}
        </span>
      </div>
    </div>
  );
};

export default CubePositionDebug;
