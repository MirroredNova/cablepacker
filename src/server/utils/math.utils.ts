import { Point } from '@/types/algorithm.types';

const FLOAT64_EQUALITY_THRESHOLD = 1e-9;

/**
 * Check if two floating point numbers are almost equal, accounting for precision issues
 * @param a The first number
 * @param b The second number
 * @returns True if the numbers are close enough to be considered equal, false otherwise
 */
export function almostEqual(a: number, b: number): boolean {
  // 9 numbers after the decimal point will need to match
  return Math.abs(a - b) <= FLOAT64_EQUALITY_THRESHOLD;
}

/**
 * Convert a hex color string to an RGB object
 * @param hex The hex color string (e.g., #a1b2c3)
 * @return An object with r, g, b properties representing the color
 */
export function polarToCartesian(angle: number, radius: number): [number, number] {
  return [radius * Math.cos((angle * Math.PI) / 180.0), radius * Math.sin((angle * Math.PI) / 180.0)];
}

/**
  * Calculate the distance between two points using the distance formula
  * @param point0 The first point with x and y coordinates
  * @param point1 The second point with x and y coordinates
  * @returns The distance between the two points
 */
export function getDistanceBetweenPoints(point0: Point, point1: Point): number {
  // distance formula: d = sqrt( (x1-x0)^2 + (y1-y0)^2 )
  const subedX = point1.x - point0.x;
  const subedY = point1.y - point0.y;
  const squaredX = subedX * subedX;
  const squaredY = subedY * subedY;
  const distance = Math.sqrt(squaredX + squaredY);
  return distance;
}
