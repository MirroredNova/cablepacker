import { PointStruct } from '@/types/algorithm';

const FLOAT64_EQUALITY_THRESHOLD = 1e-9;

export function almostEqual(a: number, b: number): boolean {
  // 9 numbers after the decimal point will need to match
  return Math.abs(a - b) <= FLOAT64_EQUALITY_THRESHOLD;
}

export function polarToCartesian(angle: number, radius: number): [number, number] {
  return [
    radius * Math.cos((angle * Math.PI) / 180.0),
    radius * Math.sin((angle * Math.PI) / 180.0),
  ];
}

export function getDistanceBetweenPoints(point0: PointStruct, point1: PointStruct): number {
  // distance formula: d = sqrt( (x1-x0)^2 + (y1-y0)^2 )
  const subedX = point1.x - point0.x;
  const subedY = point1.y - point0.y;
  const squaredX = subedX * subedX;
  const squaredY = subedY * subedY;
  const distance = Math.sqrt(squaredX + squaredY);
  return distance;
}
