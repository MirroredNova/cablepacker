import { Circle } from '@/types/algorithm.types';
import { almostEqual, polarToCartesian, getDistanceBetweenPoints } from '@/server/utils/math.utils';
import { serverConfig } from '@/config';

/**
 * Sort the list of circles from input (from largest radius to smallest radius)
 */
export function sortCircles(circleList: Circle[]): Circle[] {
  return [...circleList].sort((a, b) => b.radius - a.radius);
}

/**
 * Create a enclosing circle with the given diameter and radius
 */
export function createEnclose(diameter: number, radius: number): Circle {
  return {
    name: 'enclose',
    diameter,
    radius,
    coordinates: {
      x: 0.0,
      y: 0.0,
    },
    color: '',
  };
}

/**
 * Check if a circle's position is valid compared to all previously placed circles
 */
function circlePositionIsValid(circles: Circle[], index: number): boolean {
  const circle = circles[index];

  for (let j = 0; j < index; j += 1) {
    const dist = getDistanceBetweenPoints(circle.coordinates, circles[j].coordinates);
    const radii = circle.radius + circles[j].radius;

    // If circles overlap (with a small threshold for floating point errors)
    if (radii > dist && !almostEqual(dist, radii)) {
      return false;
    }
  }

  return true;
}

/**
 * Attempt to place a single circle inside the enclose
 */
function placeCircle(circles: Circle[], index: number, encloseRadius: number): boolean {
  const circle = circles[index];

  // Try different positions at decreasing distances from center
  for (let radius = encloseRadius - circle.radius; radius >= 0; radius -= serverConfig.RADIUS_STEP_SIZE) {
    // Try different angles around the circle
    for (let angle = 0.0; angle <= 360.0; angle += serverConfig.ANGLE_STEP_SIZE) {
      const [x, y] = polarToCartesian(angle, radius);
      circle.coordinates.x = x;
      circle.coordinates.y = y;

      // Check if this position works with all previously placed circles
      if (circlePositionIsValid(circles, index)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Check if circles can be placed within the specified circle diameter
 */
function checkEnclose(encloseDiameter: number, circleList: Circle[]): [Circle[], boolean] {
  // Create a deep copy of circleList to avoid modifying the original
  const circles = JSON.parse(JSON.stringify(circleList)) as Circle[];
  const encloseRadius = encloseDiameter / 2.0;

  // Try to place each circle
  for (let i = 0; i < circles.length; i += 1) {
    if (!placeCircle(circles, i, encloseRadius)) {
      return [circles, false];
    }
  }

  return [circles, true];
}

/**
 * Find the optimal enclose size using binary search
 */
export function findOptimalEncloseSize(circles: Circle[]): {
  enclose: Circle;
  circles: Circle[];
} {
  let validPacking = [...circles];

  // Binary search bounds
  let lowerDiameterBound = -1.0;
  let upperDiameterBound = -1.0;

  // Initial diameter guess (twice the diameter of the largest circle)
  const largestDiameter = circles[0].diameter;
  let encloseDiameter = largestDiameter * 2.0;

  let iterations = 0;

  while (iterations < serverConfig.MAX_ITERATIONS) {
    const [packing, valid] = checkEnclose(encloseDiameter, circles);

    if (valid) {
      // If valid, this becomes our upper bound
      upperDiameterBound = encloseDiameter;
      validPacking = [...packing];
    } else {
      // If invalid, this becomes our lower bound
      lowerDiameterBound = encloseDiameter;
    }

    // Adjust enclose diameter based on search bounds
    if (upperDiameterBound < 0) {
      // No upper bound yet, increase diameter
      encloseDiameter += largestDiameter;
    } else if (lowerDiameterBound < 0) {
      // No lower bound yet, decrease diameter
      encloseDiameter -= largestDiameter;
    } else {
      // We have both bounds, bisect the interval
      const diameterDifference = (upperDiameterBound - lowerDiameterBound) / 2.0;
      const nextDiameter = lowerDiameterBound + Math.max(diameterDifference, serverConfig.MIN_ENCLOSE_STEP_SIZE);

      // Check if we've converged
      if (nextDiameter >= upperDiameterBound) {
        break;
      }

      encloseDiameter = nextDiameter;
    }

    iterations += 1;
  }

  // Create the enclose with the optimal diameter
  const enclose = createEnclose(upperDiameterBound, upperDiameterBound / 2.0);

  return {
    circles: validPacking,
    enclose,
  };
}

export function calculateMinimumEncloseForCircles(circles: Circle[]): {
  enclose: Circle;
  circles: Circle[];
} {
  const sortedCircles = sortCircles(circles);
  const encloseData = findOptimalEncloseSize(sortedCircles);
  return encloseData;
}
