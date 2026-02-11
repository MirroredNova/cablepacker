import { Circle } from '@/types/algorithm.types';
import { almostEqual, polarToCartesian, getDistanceBetweenPoints } from '@/server/utils/math.utils';
import { serverConfig } from '@/config';

/**
 * Sorts an array of circles in descending order by radius.
 * @param circleList - The array of circles to sort.
 * @returns A new sorted array with circles ordered from largest to smallest radius.
 */
export function sortCircles(circleList: Circle[]): Circle[] {
  return [...circleList].sort((a, b) => b.radius - a.radius);
}

/**
 * Create a enclosing circle with the given diameter and radius
 * @param diameter The diameter of the enclosing circle
 * @param radius The radius of the enclosing circle (should be diameter / 2)
 * @returns A Circle object representing the enclosing circle
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
 * Validates whether a circle at the specified index can be positioned without overlapping other circles.
 * @param circles - Array of circles to check against
 * @param index - Index of the circle to validate in the circles array
 * @returns `true` if the circle at the given index does not overlap with any circle before it, `false` otherwise
 * @remarks
 * A small floating-point tolerance is applied when comparing distances to account for precision errors.
 * Two circles are considered overlapping if the sum of their radii is greater than the distance between their centers,
 * excluding cases where they are nearly equal (within floating-point error margin).
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
 * Attempts to place a circle at a valid position within the enclosing radius.
 *
 * @param circles - Array of circles to position
 * @param index - Index of the circle to place in the array
 * @param encloseRadius - The radius of the enclosing boundary
 * @returns `true` if a valid position was found and the circle was placed, `false` otherwise
 *
 * @remarks
 * Searches for a valid position by iterating through decreasing distances from the center
 * and angles around each distance level. The circle is placed at the first position that
 * doesn't conflict with previously placed circles. Step sizes for radius and angle are
 * configured via `serverConfig`.
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
 * Checks if all circles can be enclosed within a circular boundary and attempts to place them.
 * @param encloseDiameter - The diameter of the enclosing circle
 * @param circleList - The list of circles to place within the enclosure
 * @returns A tuple containing the placed circles and a boolean indicating if all circles were successfully placed
 * @returns [circles, true] if all circles were placed successfully within the enclosure
 * @returns [circles, false] if at least one circle could not be placed
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
 * Finds the optimal enclosing circle size that can contain all provided circles.
 *
 * Uses binary search to determine the minimum diameter of an enclosing circle
 * that can fit all input circles through iterative packing attempts.
 *
 * @param circles - Array of circles to be enclosed
 * @returns An object containing the enclosing circle and the sorted array of circles
 * @returns {Circle} enclose - The minimum circle that encloses all input circles
 * @returns {Circle[]} circles - The sorted array of circles used in the calculation
 *
 * @remarks
 * The algorithm performs a binary search bounded by:
 * - Initial guess: 2x the largest circle's diameter
 * - Convergence threshold: `MIN_ENCLOSE_STEP_SIZE` configuration
 * - Maximum iterations: `MAX_ITERATIONS` configuration
 *
 * The search adjusts the enclosing diameter based on validation results from
 * `checkEnclose()` until convergence or iteration limit is reached.
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

/**
 * Calculates the minimum enclosing circle for a set of circles.
 * @param circles - Array of circles to enclose
 * @returns An object containing the enclosing circle and the sorted array of circles
 * @returns {Circle} enclose - The minimum circle that encloses all input circles
 * @returns {Circle[]} circles - The sorted array of circles used in the calculation
 */
export function calculateMinimumEncloseForCircles(circles: Circle[]): {
  enclose: Circle;
  circles: Circle[];
} {
  const sortedCircles = sortCircles(circles);
  const encloseData = findOptimalEncloseSize(sortedCircles);
  return encloseData;
}
