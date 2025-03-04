import React, { useState, useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useCubeStore } from "../../game/state/CubeState";
import { usePlayerStore } from "../../game/state/PlayerState";

const CubePlacementPreview: React.FC = () => {
  const { camera, scene } = useThree();
  const addCube = useCubeStore((state) => state.addCube);
  const removeCube = useCubeStore((state) => state.removeCube);
  const hasReachedLimit = useCubeStore((state) => state.hasReachedLimit);
  const getCubeAtPosition = useCubeStore((state) => state.getCubeAtPosition);
  const localPlayerId = usePlayerStore((state) => state.localPlayerId);

  // State for the preview cube
  const [previewPosition, setPreviewPosition] = useState<THREE.Vector3 | null>(
    null
  );
  const [isValidPlacement, setIsValidPlacement] = useState(false);

  // Reference to the preview mesh
  const previewMeshRef = useRef<THREE.Mesh>(null);

  // Throttling state
  const lastUpdateTime = useRef(0);
  const updateCooldown = 150; // ms between updates

  // Maximum distance for cube placement
  const MAX_PLACEMENT_DISTANCE = 5;

  // Create raycaster once
  const raycaster = new THREE.Raycaster();
  const screenCenter = new THREE.Vector2(0, 0);

  // Create a layer for raycasting (to exclude preview objects)
  const RAYCAST_LAYER = 1;

  // Helper function to snap to grid with 0.5 offset (0.5, 1.5, 2.5, etc.)
  const snapToGrid = (pos: THREE.Vector3): THREE.Vector3 => {
    // Round to nearest whole number and add 0.5
    const snapX = Math.floor(pos.x) + 0.5;
    const snapZ = Math.floor(pos.z) + 0.5;

    // For Y, we want 0.5, 1.5, 2.5, etc. but with a minimum of 0.5
    let snapY = Math.floor(pos.y) + 0.5;
    if (snapY < 0.5) snapY = 0.5;

    return new THREE.Vector3(snapX, snapY, snapZ);
  };

  // Helper function to check if a position is valid for placement
  const isValidPosition = (pos: THREE.Vector3): boolean => {
    if (!pos) return false;

    // Check if position is already occupied by another cube
    return !getCubeAtPosition(pos);
  };

  // Helper function to adjust position for floor placement
  const adjustPositionForFloor = (pos: THREE.Vector3): THREE.Vector3 => {
    // Create a position that's properly on the grid
    const adjustedPos = snapToGrid(pos);

    return adjustedPos;
  };

  // Set up the raycaster to ignore the preview mesh
  useEffect(() => {
    // Make sure the preview mesh is excluded from raycasting
    if (previewMeshRef.current) {
      // Set the preview mesh to not be in the raycasting layer
      previewMeshRef.current.layers.disable(RAYCAST_LAYER);
    }
  }, []);

  // Main update loop
  useFrame(() => {
    // If we've reached the cube limit, hide the preview and don't process further
    if (hasReachedLimit()) {
      setPreviewPosition(null);
      setIsValidPlacement(false);
      return;
    }

    // Throttle updates to reduce flickering
    const now = Date.now();
    if (now - lastUpdateTime.current < updateCooldown) {
      return;
    }

    // Update raycaster with camera position and direction
    raycaster.setFromCamera(screenCenter, camera);

    // Get all meshes in the scene that should be considered for raycasting
    const targetMeshes: THREE.Object3D[] = [];

    // Ensure all objects (except preview) have the raycast layer enabled
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh && object !== previewMeshRef.current) {
        // Enable the raycast layer for this object
        object.layers.enable(RAYCAST_LAYER);
        targetMeshes.push(object);
      }
    });

    // Cast ray and find intersections
    const intersects = raycaster.intersectObjects(targetMeshes, false);

    // Process the closest intersection if within range
    if (
      intersects.length > 0 &&
      intersects[0].distance <= MAX_PLACEMENT_DISTANCE
    ) {
      const intersection = intersects[0];

      // Only proceed if we have a face normal
      if (intersection.face && intersection.face.normal) {
        // Calculate position for the new cube
        const point = intersection.point.clone();
        const normal = intersection.face.normal.clone();

        // Move slightly away from the surface in the direction of the normal
        const placementPosition = point.add(normal.multiplyScalar(0.5));

        // Adjust position for floor placement and snap to grid
        const adjustedPosition = adjustPositionForFloor(placementPosition);

        // Check if this position is valid
        const valid = isValidPosition(adjustedPosition);

        // Update the preview position and validity
        setPreviewPosition(adjustedPosition);
        setIsValidPlacement(valid);
        lastUpdateTime.current = now;
      }
    } else {
      // No valid intersection, hide the preview
      setPreviewPosition(null);
      setIsValidPlacement(false);
      lastUpdateTime.current = now;
    }
  });

  // Handle click to place or remove cube
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Check if we should remove a cube (right-click or cmd+click)
      const isRemoveAction = e.button === 2 || (e.button === 0 && e.metaKey);

      if (isRemoveAction) {
        // If we have a preview position, try to remove a cube at that position
        if (previewPosition) {
          const cubeAtPosition = getCubeAtPosition(previewPosition);

          // Only allow removal if the cube belongs to the local player
          if (cubeAtPosition && cubeAtPosition.playerId === localPlayerId) {
            removeCube(previewPosition);
          }
        }
      } else if (previewPosition && isValidPlacement && !hasReachedLimit()) {
        // Normal left-click to place a cube
        addCube(previewPosition);
      }
    };

    // Prevent context menu on right-click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    window.addEventListener("click", handleClick);
    window.addEventListener("contextmenu", handleContextMenu);

    return () => {
      window.removeEventListener("click", handleClick);
      window.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [
    previewPosition,
    isValidPlacement,
    addCube,
    removeCube,
    hasReachedLimit,
    getCubeAtPosition,
    localPlayerId,
  ]);

  // Don't render anything if we don't have a position or have reached the limit
  if (!previewPosition || hasReachedLimit()) return null;

  return (
    <>
      {/* Render the preview cube */}
      <mesh
        ref={previewMeshRef}
        position={[previewPosition.x, previewPosition.y, previewPosition.z]}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={isValidPlacement ? "green" : "red"}
          transparent={true}
          opacity={0.5}
        />
      </mesh>
    </>
  );
};

export default CubePlacementPreview;
