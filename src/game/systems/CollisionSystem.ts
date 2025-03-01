import * as THREE from "three";

// Simple collision detection between two objects with bounding spheres
export const checkSphereCollision = (
  position1: THREE.Vector3,
  radius1: number,
  position2: THREE.Vector3,
  radius2: number
): boolean => {
  const distance = position1.distanceTo(position2);
  return distance < radius1 + radius2;
};

// Simple collision detection between an object and the floor
export const checkFloorCollision = (
  position: THREE.Vector3,
  radius: number,
  floorY: number = 0
): boolean => {
  return position.y - radius <= floorY;
};

// Resolve floor collision by adjusting position
export const resolveFloorCollision = (
  position: THREE.Vector3,
  radius: number,
  floorY: number = 0
): THREE.Vector3 => {
  if (position.y - radius < floorY) {
    position.y = floorY + radius;
  }
  return position;
};
