import React, { useState, useEffect, useRef, useMemo } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useCubeStore } from "../../game/state/CubeState";
import { usePlayerStore } from "../../game/state/PlayerState";
import { useKeyPress } from "../../hooks/useKeyPress";
import { useDebugStore } from "../../game/state/DebugState";
import { useGameStateStore } from "../../game/state/GameStateStore";
import { getPlayerColor } from "../../utils/colours";
import { riverWidth } from "../../components/environment/Floor";

const CubePlacementPreview: React.FC = () => {
  const { camera, scene } = useThree();
  const addCube = useCubeStore((state) => state.addCube);
  const removeCube = useCubeStore((state) => state.removeCube);
  const hasReachedLimit = useCubeStore((state) => state.hasReachedLimit);
  const getCubeAtPosition = useCubeStore((state) => state.getCubeAtPosition);
  const localPlayerId = usePlayerStore((state) => state.localPlayerId);
  const debugModeEnabled = useDebugStore((state) => state.debugModeEnabled);
  // Get the ability to modify cubes from the GameStateStore
  const canModifyCubes = useGameStateStore((state) => state.canModifyCubes());

  // Memoize the player's cube color
  const playerCubeColor = useMemo(() => {
    return getPlayerColor(localPlayerId || "default");
  }, [localPlayerId]);

  // Track control key press for removal mode
  const isControlLeftPressed = useKeyPress("ControlLeft");
  const isControlRightPressed = useKeyPress("ControlRight");
  const isControlPressed = isControlLeftPressed || isControlRightPressed;

  // Removal mode state
  const isRemovalMode = isControlPressed;

  // State for the preview cube
  const [previewPosition, setPreviewPosition] = useState<THREE.Vector3 | null>(
    null
  );
  const [isValidPlacement, setIsValidPlacement] = useState(false);

  // State for tracking if we're hovering over a removable cube
  const [hoverRemovableCube, setHoverRemovableCube] =
    useState<THREE.Vector3 | null>(null);

  // New state for tracking cursor position (where the ray hits)
  const [cursorPosition, setCursorPosition] = useState<THREE.Vector3 | null>(
    null
  );

  // New state for tracking placement position (before grid adjustment)
  const [placementPosition, setPlacementPosition] =
    useState<THREE.Vector3 | null>(null);

  // Reference to the preview mesh
  const previewMeshRef = useRef<THREE.Mesh>(null);

  // Reference to the removal indicator mesh
  const removalIndicatorRef = useRef<THREE.Mesh>(null);

  // Throttling state
  const lastUpdateTime = useRef(0);
  const updateCooldown = 150; // ms between updates

  // Maximum distance for cube placement/removal
  const MAX_PLACEMENT_DISTANCE = 5;

  // Create raycaster once
  const raycaster = new THREE.Raycaster();
  const screenCenter = new THREE.Vector2(0, 0);

  // Create a layer for raycasting (to exclude preview objects)
  const RAYCAST_LAYER = 1;

  // Add this to get the update function from the debug store
  const updateCursorDebug = useDebugStore((state) => state.updateCursorDebug);

  // Helper function to snap to grid with 0.5 offset (0.5, 1.5, 2.5, etc.)
  const snapToGrid = (pos: THREE.Vector3): THREE.Vector3 => {
    // Round to nearest whole number and add 0.5
    // z of 3.6 should go to 3.5
    const snapX = Math.floor(pos.x) + 0.5;
    const snapZ = Math.floor(pos.z) + 0.5;

    // For Y, we want 0.5, 1.5, 2.5, etc. but with a minimum of 0.5
    let snapY = Math.floor(pos.y) + 0.5;
    if (snapY < 0.5) snapY = 0.5;

    return new THREE.Vector3(snapX, snapY, snapZ);
  };

  // Helper function to check if a position is over the river
  const isOverRiver = (pos: THREE.Vector3): boolean => {
    return Math.abs(pos.x) < riverWidth / 2;
  };

  // Helper function to check if a position has an adjacent cube
  const hasAdjacentCube = (pos: THREE.Vector3): boolean => {
    const adjacentPositions = [
      new THREE.Vector3(pos.x + 1, pos.y, pos.z),
      new THREE.Vector3(pos.x - 1, pos.y, pos.z),
      new THREE.Vector3(pos.x, pos.y + 1, pos.z),
      new THREE.Vector3(pos.x, pos.y - 1, pos.z),
      new THREE.Vector3(pos.x, pos.y, pos.z + 1),
      new THREE.Vector3(pos.x, pos.y, pos.z - 1),
    ];

    return adjacentPositions.some((adjPos) => getCubeAtPosition(adjPos));
  };

  // Helper function to check if a position is valid for placement
  const isValidPosition = (pos: THREE.Vector3): boolean => {
    if (!pos) return false;

    // Check if position is already occupied by another cube
    if (getCubeAtPosition(pos)) return false;

    // If over river, only allow if adjacent to a cube
    if (isOverRiver(pos) && !hasAdjacentCube(pos)) {
      return false;
    }

    // Otherwise, position is valid
    return true;
  };

  // Helper function to adjust position for floor placement
  const adjustPositionForFloor = (pos: THREE.Vector3): THREE.Vector3 => {
    // Create a position that's properly on the grid
    const adjustedPos = snapToGrid(pos);
    // console.log("Got this for floor: ", adjustedPos);

    return adjustedPos;
  };

  // Helper function to check if a cube at position is removable by local player
  const isRemovableCube = (pos: THREE.Vector3): boolean => {
    if (!pos) return false;

    const cube = getCubeAtPosition(pos);
    const isRemovable = !!cube && cube.playerId === localPlayerId;

    if (cube && !isRemovable) {
      console.log(
        "Cube found but not removable. Owner:",
        cube.playerId,
        "Local:",
        localPlayerId
      );
    }

    return isRemovable;
  };

  // Set up the raycaster to ignore the preview mesh
  useEffect(() => {
    // Make sure the preview mesh is excluded from raycasting
    if (previewMeshRef.current) {
      // Set the preview mesh to not be in the raycasting layer
      previewMeshRef.current.layers.disable(RAYCAST_LAYER);
    }

    // Also exclude the removal indicator from raycasting
    if (removalIndicatorRef.current) {
      removalIndicatorRef.current.layers.disable(RAYCAST_LAYER);
    }
  }, []);

  // Update cursor style based on mode
  useEffect(() => {
    if (isRemovalMode && canModifyCubes) {
      document.body.style.cursor = hoverRemovableCube
        ? "pointer"
        : "not-allowed";
    } else {
      document.body.style.cursor = "default";
    }

    return () => {
      document.body.style.cursor = "default";
    };
  }, [isRemovalMode, hoverRemovableCube, isControlPressed, canModifyCubes]);

  // Main update loop
  useFrame(() => {
    // Skip processing if game is not in ACTIVE phase
    if (!canModifyCubes) {
      // Clear all preview states when not in active phase
      setCursorPosition(null);
      setPreviewPosition(null);
      setPlacementPosition(null);
      setIsValidPlacement(false);
      setHoverRemovableCube(null);
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
      if (
        object instanceof THREE.Mesh &&
        object !== previewMeshRef.current &&
        object !== removalIndicatorRef.current
      ) {
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
        // Get the position of the intersected object
        const intersectedObject = intersection.object;
        const intersectedPosition = new THREE.Vector3().setFromMatrixPosition(
          intersectedObject.matrixWorld
        );

        // Try to find a cube at the intersected position
        const cubeAtIntersection = getCubeAtPosition(
          snapToGrid(intersectedPosition)
        );

        // Calculate position for the new cube
        const point = intersection.point.clone();
        const normal = intersection.face.normal.clone();

        // Store the cursor position (where the ray hits)
        setCursorPosition(point.clone());

        // Move slightly away from the surface in the direction of the normal
        const newPlacementPosition =
          point.y < 0.5 ? point : point.add(normal.multiplyScalar(0.5));

        // Store the placement position
        setPlacementPosition(newPlacementPosition.clone());

        if (isRemovalMode) {
          // In removal mode, first check if we're directly clicking on a cube
          if (
            cubeAtIntersection &&
            cubeAtIntersection.playerId === localPlayerId
          ) {
            // We're hovering over a removable cube
            const cubePosition = new THREE.Vector3(
              cubeAtIntersection.position.x,
              cubeAtIntersection.position.y,
              cubeAtIntersection.position.z
            );
            setHoverRemovableCube(cubePosition);
          } else {
            // Check if there's a removable cube at the adjusted position
            const canRemove = isRemovableCube(newPlacementPosition);
            setHoverRemovableCube(canRemove ? newPlacementPosition : null);
          }

          // Hide the placement preview in removal mode
          setPreviewPosition(null);
          setIsValidPlacement(false);
        } else {
          // Adjust position for floor placement and snap to grid
          const adjustedPosition = adjustPositionForFloor(point);

          // Check if this position is valid (not over river unless adjacent to cube)
          const isValid = isValidPosition(adjustedPosition);

          // Only show preview if the position is valid
          if (isValid) {
            setPreviewPosition(adjustedPosition);
            setIsValidPlacement(true);
          } else {
            // Don't show preview for invalid positions (i.e., river without adjacent cubes)
            setPreviewPosition(null);
            setIsValidPlacement(false);
          }

          // Clear removal hover state
          setHoverRemovableCube(null);
        }

        if (debugModeEnabled) {
          updateCursorDebug({
            cursorPosition,
            previewPosition,
            placementPosition,
            isValidPlacement,
            isRemovalMode,
            hoverRemovableCube,
          });
        }

        lastUpdateTime.current = now;
      }
    } else {
      // No valid intersection, hide both previews
      setCursorPosition(null);
      setPreviewPosition(null);
      setPlacementPosition(null);
      setIsValidPlacement(false);
      setHoverRemovableCube(null);
      lastUpdateTime.current = now;
    }
  });

  // Handle control+click to remove cube
  useEffect(() => {
    const handleControlClick = (e: MouseEvent) => {
      // Only handle control+click and only when game is active
      if (e.ctrlKey && e.button === 0 && canModifyCubes) {
        console.log("Control+click detected");

        // Prevent default to avoid other click handlers
        e.preventDefault();
        e.stopPropagation();

        // If we have a hoverable removable cube, remove it
        if (hoverRemovableCube) {
          console.log(
            "Attempting to remove cube on control+click at:",
            hoverRemovableCube
          );
          removeCube(hoverRemovableCube);
        } else {
          console.log("No removable cube found for control+click");
        }
      }
    };

    window.addEventListener("click", handleControlClick, true); // Use capture phase

    return () => {
      window.removeEventListener("click", handleControlClick, true);
    };
  }, [hoverRemovableCube, removeCube, canModifyCubes]);

  // Handle regular click to place cube
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Only handle regular clicks (not control+click) and only when game is active
      if (!e.ctrlKey && e.button === 0 && canModifyCubes) {
        if (previewPosition && isValidPlacement && !hasReachedLimit()) {
          // Normal left-click to place a cube
          addCube(previewPosition);
        }
      }
    };

    window.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("click", handleClick);
    };
  }, [
    previewPosition,
    isValidPlacement,
    addCube,
    hasReachedLimit,
    canModifyCubes,
  ]);

  return (
    <>
      {/* Render the preview cube (only in placement mode and when game is active) */}
      {previewPosition &&
        !isRemovalMode &&
        !hasReachedLimit() &&
        canModifyCubes && (
          <mesh
            ref={previewMeshRef}
            position={[previewPosition.x, previewPosition.y, previewPosition.z]}
          >
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial
              color={isValidPlacement ? playerCubeColor : "red"}
              transparent={true}
              opacity={0.5}
            />
          </mesh>
        )}

      {/* Render the removal indicator (only in removal mode and when game is active) */}
      {hoverRemovableCube && isRemovalMode && canModifyCubes && (
        <mesh
          ref={removalIndicatorRef}
          position={[
            hoverRemovableCube.x,
            hoverRemovableCube.y,
            hoverRemovableCube.z,
          ]}
        >
          <boxGeometry args={[1.1, 1.1, 1.1]} />
          <meshStandardMaterial
            color="red"
            transparent={true}
            opacity={0.6}
            wireframe={false}
            emissive="red"
            emissiveIntensity={0.5}
          />
        </mesh>
      )}
    </>
  );
};

export default CubePlacementPreview;
