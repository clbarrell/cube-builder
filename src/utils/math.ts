import * as THREE from "three";

/**
 * Converts degrees to radians
 */
export const degToRad = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Converts radians to degrees
 */
export const radToDeg = (radians: number): number => {
  return radians * (180 / Math.PI);
};

/**
 * Generates a random number between min and max (inclusive)
 */
export const randomRange = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

/**
 * Generates a random integer between min and max (inclusive)
 */
export const randomInt = (min: number, max: number): number => {
  return Math.floor(randomRange(min, max + 1));
};

/**
 * Generates a random position within specified bounds
 */
export const randomPosition = (
  minX: number,
  maxX: number,
  minY: number,
  maxY: number,
  minZ: number,
  maxZ: number
): THREE.Vector3 => {
  return new THREE.Vector3(
    randomRange(minX, maxX),
    randomRange(minY, maxY),
    randomRange(minZ, maxZ)
  );
};
