import React, { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import * as THREE from "three";

// First-person movement controls
const FirstPersonControls: React.FC = () => {
  const { camera } = useThree();
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
  const minY = useRef(1); // Minimum height (to prevent going below floor)

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

  useFrame(() => {
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

    // Apply movement based on key states
    if (moveState.current.forward) camera.position.add(frontVector);
    if (moveState.current.backward) camera.position.sub(frontVector);
    if (moveState.current.left) camera.position.sub(sideVector);
    if (moveState.current.right) camera.position.add(sideVector);
    if (moveState.current.up)
      camera.position.add(upVector.clone().multiplyScalar(speed.current));
    if (moveState.current.down)
      camera.position.sub(upVector.clone().multiplyScalar(speed.current));

    // Prevent going below floor
    if (camera.position.y < minY.current) {
      camera.position.y = minY.current;
    }
  });

  return <PointerLockControls />;
};

export default FirstPersonControls;
