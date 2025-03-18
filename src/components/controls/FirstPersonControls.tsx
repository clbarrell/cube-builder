import React, { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import * as THREE from "three";
import { useCubeStore } from "../../game/state/CubeState";
import { riverWidth, riverBottomY, landHeight } from "../environment/Floor";

// First-person movement controls
const FirstPersonControls: React.FC = () => {
  const { camera } = useThree();
  const cubes = useCubeStore((state) => state.cubes);

  const moveState = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false,
  });

  // Camera settings
  const speed = useRef(0.1);
  const playerRadius = 0.4; // Reduced collision radius for the player
  const emergencyEscapeSpeed = 0.2; // Speed for emergency escape when stuck

  // Track if we're stuck
  const stuckFrames = useRef(0);
  const MAX_STUCK_FRAMES = 10; // Number of frames to consider as "stuck"
  const isStuck = useRef(false);

  useEffect(() => {
    // Initial camera position
    camera.position.set(0, 2, 5);

    // Key down event handler
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          moveState.current.forward = true;
          break;
        case "KeyS":
        case "ArrowDown":
          moveState.current.backward = true;
          break;
        case "KeyA":
        case "ArrowLeft":
          moveState.current.left = true;
          break;
        case "KeyD":
        case "ArrowRight":
          moveState.current.right = true;
          break;
        case "Space":
          moveState.current.up = true;
          break;
        case "ShiftLeft":
        case "ShiftRight":
          moveState.current.down = true;
          break;
        default:
          break;
      }
    };

    // Key up event handler
    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          moveState.current.forward = false;
          break;
        case "KeyS":
        case "ArrowDown":
          moveState.current.backward = false;
          break;
        case "KeyA":
        case "ArrowLeft":
          moveState.current.left = false;
          break;
        case "KeyD":
        case "ArrowRight":
          moveState.current.right = false;
          break;
        case "Space":
          moveState.current.up = false;
          break;
        case "ShiftLeft":
        case "ShiftRight":
          moveState.current.down = false;
          break;
        default:
          break;
      }
    };

    // Add event listeners
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Cleanup
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [camera]);

  // Check if a position collides with any cube
  const checkCubeCollision = (position: THREE.Vector3) => {
    // Check collision with each cube
    for (const cube of cubes) {
      // Simple box-sphere collision detection
      // Calculate the closest point on the cube to the player position
      const closestPoint = new THREE.Vector3(
        Math.max(
          cube.position.x - 0.5,
          Math.min(position.x, cube.position.x + 0.5)
        ),
        Math.max(
          cube.position.y - 0.5,
          Math.min(position.y, cube.position.y + 0.5)
        ),
        Math.max(
          cube.position.z - 0.5,
          Math.min(position.z, cube.position.z + 0.5)
        )
      );

      // Calculate distance from closest point to player position
      const distance = position.distanceTo(closestPoint);

      // If distance is less than player radius, there's a collision
      if (distance < playerRadius) {
        return true;
      }
    }

    return false;
  };

  // Check if moving from current position to new position would move into a cube
  const isMovingIntoCube = (
    currentPos: THREE.Vector3,
    newPos: THREE.Vector3
  ) => {
    // If we're not currently in a cube but the new position is in a cube, we're moving into a cube
    if (!checkCubeCollision(currentPos) && checkCubeCollision(newPos)) {
      return true;
    }

    // If we're in a cube, check if we're moving further into it or out of it
    if (checkCubeCollision(currentPos)) {
      // For each cube, check if we're moving closer to its center or further away
      for (const cube of cubes) {
        const cubeCenter = new THREE.Vector3(
          cube.position.x,
          cube.position.y,
          cube.position.z
        );

        // Calculate distances from current and new positions to cube center
        const currentDistance = currentPos.distanceTo(cubeCenter);
        const newDistance = newPos.distanceTo(cubeCenter);

        // If we're inside this cube and moving closer to its center, prevent movement
        if (currentDistance < 0.866 && newDistance < currentDistance) {
          // 0.866 = sqrt(3)/2 (half diagonal of a unit cube)
          return true;
        }
      }
    }

    return false;
  };

  // Emergency escape function to prevent getting stuck
  const tryEmergencyEscape = () => {
    // Try to move in all 6 directions to find an escape route
    const directions = [
      new THREE.Vector3(1, 0, 0), // +X
      new THREE.Vector3(-1, 0, 0), // -X
      new THREE.Vector3(0, 1, 0), // +Y
      new THREE.Vector3(0, -1, 0), // -Y
      new THREE.Vector3(0, 0, 1), // +Z
      new THREE.Vector3(0, 0, -1), // -Z
    ];

    // Try each direction
    for (const dir of directions) {
      const escapePosition = camera.position
        .clone()
        .add(dir.multiplyScalar(emergencyEscapeSpeed));

      if (!checkCubeCollision(escapePosition)) {
        // Found an escape route
        camera.position.copy(escapePosition);
        isStuck.current = false;
        stuckFrames.current = 0;
        return true;
      }
    }

    // If we get here, we couldn't find an escape route
    // As a last resort, try moving upward more aggressively
    const upwardEscape = camera.position
      .clone()
      .add(new THREE.Vector3(0, 1, 0).multiplyScalar(emergencyEscapeSpeed * 2));

    if (!checkCubeCollision(upwardEscape)) {
      camera.position.copy(upwardEscape);
      isStuck.current = false;
      stuckFrames.current = 0;
      return true;
    }

    return false;
  };

  // Check if a player is over the river
  const isOverRiver = (x: number) => {
    return Math.abs(x) <= riverWidth / 2;
  };

  // Get minimum height based on position (river or land)
  const getMinHeight = (position: THREE.Vector3) => {
    return (isOverRiver(position.x) ? riverBottomY : landHeight) + 0.5;
  };

  // Main update loop
  useFrame(() => {
    // Check if we're currently stuck inside a cube
    if (checkCubeCollision(camera.position)) {
      stuckFrames.current++;

      if (stuckFrames.current >= MAX_STUCK_FRAMES) {
        isStuck.current = true;
      }

      if (isStuck.current) {
        // Try to escape
        if (tryEmergencyEscape()) {
          // Successfully escaped
          return;
        }
      }
    } else {
      // Not colliding, reset stuck counter
      stuckFrames.current = 0;
      isStuck.current = false;
    }

    // Get camera direction
    const direction = new THREE.Vector3();
    const frontVector = new THREE.Vector3();
    const sideVector = new THREE.Vector3();
    const upVector = new THREE.Vector3(0, 1, 0);

    // Calculate movement direction
    camera.getWorldDirection(direction);
    frontVector
      .set(direction.x, 0, direction.z)
      .normalize()
      .multiplyScalar(speed.current);
    sideVector
      .setFromMatrixColumn(camera.matrix, 0)
      .normalize()
      .multiplyScalar(speed.current);

    // Store current position to revert to if collision occurs
    const originalPosition = camera.position.clone();

    // Try each movement direction separately to allow sliding along walls
    let newPosition = camera.position.clone();

    // Apply movement based on key states
    if (moveState.current.forward) {
      newPosition.add(frontVector);
      if (isMovingIntoCube(originalPosition, newPosition)) {
        newPosition.copy(originalPosition);
      } else {
        camera.position.copy(newPosition);
      }
    }

    newPosition = camera.position.clone();
    if (moveState.current.backward) {
      newPosition.sub(frontVector);
      if (isMovingIntoCube(originalPosition, newPosition)) {
        newPosition.copy(originalPosition);
      } else {
        camera.position.copy(newPosition);
      }
    }

    newPosition = camera.position.clone();
    if (moveState.current.left) {
      newPosition.sub(sideVector);
      if (isMovingIntoCube(originalPosition, newPosition)) {
        newPosition.copy(originalPosition);
      } else {
        camera.position.copy(newPosition);
      }
    }

    newPosition = camera.position.clone();
    if (moveState.current.right) {
      newPosition.add(sideVector);
      if (isMovingIntoCube(originalPosition, newPosition)) {
        newPosition.copy(originalPosition);
      } else {
        camera.position.copy(newPosition);
      }
    }

    newPosition = camera.position.clone();
    if (moveState.current.up) {
      newPosition.add(upVector.clone().multiplyScalar(speed.current));
      if (isMovingIntoCube(originalPosition, newPosition)) {
        newPosition.copy(originalPosition);
      } else {
        camera.position.copy(newPosition);
      }
    }

    newPosition = camera.position.clone();
    if (moveState.current.down) {
      newPosition.sub(upVector.clone().multiplyScalar(speed.current));
      if (isMovingIntoCube(originalPosition, newPosition)) {
        newPosition.copy(originalPosition);
      } else {
        camera.position.copy(newPosition);
      }
    }

    // Prevent going below floor or river bottom based on position
    const minY = getMinHeight(camera.position);
    if (camera.position.y < minY) {
      camera.position.y = minY;
    }
  });

  return <PointerLockControls />;
};

export default FirstPersonControls;
