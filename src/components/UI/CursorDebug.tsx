import React from "react";
import * as THREE from "three";

interface CursorDebugProps {
  cursorPosition: THREE.Vector3 | null;
  previewPosition: THREE.Vector3 | null;
  placementPosition: THREE.Vector3 | null;
  isValidPlacement: boolean;
  isRemovalMode: boolean;
  hoverRemovableCube: THREE.Vector3 | null;
}

const CursorDebug: React.FC<CursorDebugProps> = ({
  cursorPosition,
  previewPosition,
  placementPosition,
  isValidPlacement,
  isRemovalMode,
  hoverRemovableCube,
}) => {
  if (!cursorPosition && !previewPosition) return null;

  return (
    <div className="fixed bottom-0 left-0 bg-black/70 text-white px-4 py-2 rounded-md font-mono text-sm z-50 max-w-xs">
      <div className="font-bold mb-2">Debug Info</div>

      {/* Mode indicator */}
      <div className="mb-2">
        <span className="font-bold">Mode: </span>
        <span className={isRemovalMode ? "text-red-400" : "text-green-400"}>
          {isRemovalMode ? "REMOVAL" : "PLACEMENT"}
        </span>
      </div>

      {/* Cursor position */}
      <div className="mb-2">
        <div className="font-bold">Cursor Position:</div>
        {cursorPosition ? (
          <>
            <div>X: {cursorPosition.x.toFixed(2)}</div>
            <div>Y: {cursorPosition.y.toFixed(2)}</div>
            <div>Z: {cursorPosition.z.toFixed(2)}</div>
          </>
        ) : (
          <div className="text-gray-400">No cursor position</div>
        )}
      </div>

      {/* Preview cube position */}
      <div className="mb-2">
        <div className="font-bold">Preview Cube:</div>
        {previewPosition ? (
          <>
            <div>X: {previewPosition.x.toFixed(2)}</div>
            <div>Y: {previewPosition.y.toFixed(2)}</div>
            <div>Z: {previewPosition.z.toFixed(2)}</div>
            <div className="mt-1">
              Status:
              <span
                className={
                  isValidPlacement ? "text-green-400 ml-2" : "text-red-400 ml-2"
                }
              >
                {isValidPlacement ? "VALID" : "INVALID"}
              </span>
            </div>
          </>
        ) : (
          <div className="text-gray-400">No preview cube</div>
        )}
      </div>

      {/* Placement position */}
      <div className="mb-2">
        <div className="font-bold">Placement Position:</div>
        {placementPosition ? (
          <>
            <div>X: {placementPosition.x.toFixed(2)}</div>
            <div>Y: {placementPosition.y.toFixed(2)}</div>
            <div>Z: {placementPosition.z.toFixed(2)}</div>
          </>
        ) : (
          <div className="text-gray-400">No placement position</div>
        )}
      </div>

      {/* Removable cube info */}
      {isRemovalMode && (
        <div>
          <div className="font-bold">Removable Cube:</div>
          {hoverRemovableCube ? (
            <>
              <div>X: {hoverRemovableCube.x.toFixed(2)}</div>
              <div>Y: {hoverRemovableCube.y.toFixed(2)}</div>
              <div>Z: {hoverRemovableCube.z.toFixed(2)}</div>
            </>
          ) : (
            <div className="text-gray-400">No removable cube</div>
          )}
        </div>
      )}
    </div>
  );
};

export default CursorDebug;
