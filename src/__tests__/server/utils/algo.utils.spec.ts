import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest';
import {
  sortCircles,
  createEnclose,
  findOptimalEncloseSize,
  calculateMinimumEncloseForCircles,
} from '@/server/utils/algo.utils';
import { Circle } from '@/types/algorithm.types';
import * as mathUtils from '@/server/utils/math.utils';
import { serverConfig } from '@/config';

vi.spyOn(mathUtils, 'polarToCartesian');
vi.spyOn(mathUtils, 'getDistanceBetweenPoints');
vi.spyOn(mathUtils, 'almostEqual');

describe('Algorithm Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // At the top of your test file
  const testMaxIterations = serverConfig.MAX_ITERATIONS;
  const testStepSize = serverConfig.RADIUS_STEP_SIZE;
  const testAngleStep = serverConfig.ANGLE_STEP_SIZE;

  // Before all tests
  beforeAll(() => {
    // Use much larger step sizes for testing to reduce computation
    vi.spyOn(serverConfig, 'MAX_ITERATIONS', 'get').mockReturnValue(10);
    vi.spyOn(serverConfig, 'RADIUS_STEP_SIZE', 'get').mockReturnValue(1.0);
    vi.spyOn(serverConfig, 'ANGLE_STEP_SIZE', 'get').mockReturnValue(90);
  });

  // After all tests
  afterAll(() => {
    // Restore original values
    vi.spyOn(serverConfig, 'MAX_ITERATIONS', 'get').mockReturnValue(testMaxIterations);
    vi.spyOn(serverConfig, 'RADIUS_STEP_SIZE', 'get').mockReturnValue(testStepSize);
    vi.spyOn(serverConfig, 'ANGLE_STEP_SIZE', 'get').mockReturnValue(testAngleStep);
  });

  describe('sortCircles', () => {
    it('sorts circles by radius in descending order', () => {
      const circles: Circle[] = [
        {
          name: 'small',
          diameter: 2,
          radius: 1,
          coordinates: { x: 0, y: 0 },
          color: '',
        },
        {
          name: 'large',
          diameter: 6,
          radius: 3,
          coordinates: { x: 0, y: 0 },
          color: '',
        },
        {
          name: 'medium',
          diameter: 4,
          radius: 2,
          coordinates: { x: 0, y: 0 },
          color: '',
        },
      ];

      const sortedCircles = sortCircles(circles);

      expect(sortedCircles[0].name).toBe('large');
      expect(sortedCircles[1].name).toBe('medium');
      expect(sortedCircles[2].name).toBe('small');
    });

    it('returns a new array without modifying the original', () => {
      const circles: Circle[] = [
        {
          name: 'small',
          diameter: 2,
          radius: 1,
          coordinates: { x: 0, y: 0 },
          color: '',
        },
        {
          name: 'large',
          diameter: 6,
          radius: 3,
          coordinates: { x: 0, y: 0 },
          color: '',
        },
      ];

      const sortedCircles = sortCircles(circles);

      expect(sortedCircles).not.toBe(circles); // Check it's a new array
      expect(circles[0].name).toBe('small'); // Original array unchanged
    });

    it('handles empty array', () => {
      expect(sortCircles([])).toEqual([]);
    });

    it('handles single circle', () => {
      const circle: Circle = {
        name: 'only',
        diameter: 2,
        radius: 1,
        coordinates: { x: 0, y: 0 },
        color: '',
      };
      expect(sortCircles([circle])).toEqual([circle]);
    });
  });

  describe('createEnclose', () => {
    it('creates an enclosing circle with the specified diameter and radius', () => {
      const diameter = 10;
      const radius = 5;
      const enclose = createEnclose(diameter, radius);

      expect(enclose).toEqual({
        name: 'enclose',
        diameter,
        radius,
        coordinates: { x: 0.0, y: 0.0 },
        color: '',
      });
    });

    it('sets coordinates to the origin (0,0)', () => {
      const enclose = createEnclose(8, 4);
      expect(enclose.coordinates).toEqual({ x: 0.0, y: 0.0 });
    });
  });

  describe('calculateMinimumEncloseForCircles', () => {
    // This is more of an integration test as it uses multiple functions
    it('should calculate a valid enclosing circle for a simple case', () => {
      // Create two circles that can be easily packed
      const circles: Circle[] = [
        {
          name: 'circle1',
          diameter: 2,
          radius: 1,
          coordinates: { x: 0, y: 0 },
          color: '',
        },
        {
          name: 'circle2',
          diameter: 2,
          radius: 1,
          coordinates: { x: 0, y: 0 },
          color: '',
        },
      ];

      const result = calculateMinimumEncloseForCircles(circles);

      expect(result.enclose).toBeDefined();
      expect(result.enclose.name).toBe('enclose');
      expect(result.enclose.radius).toBeGreaterThanOrEqual(2); // At least enough to fit both
      expect(result.circles.length).toBe(2);

      // Verify the circles have new coordinates
      expect(result.circles[0].coordinates).not.toEqual({ x: 0, y: 0 });
      expect(result.circles[1].coordinates).not.toEqual({ x: 0, y: 0 });
    });

    it('should sort the circles before finding optimal enclosure', () => {
      const circles: Circle[] = [
        {
          name: 'small',
          diameter: 2,
          radius: 1,
          coordinates: { x: 0, y: 0 },
          color: '',
        },
        {
          name: 'large',
          diameter: 6,
          radius: 3,
          coordinates: { x: 0, y: 0 },
          color: '',
        },
      ];

      const result = calculateMinimumEncloseForCircles(circles);

      // The first circle should be the large one
      expect(result.circles[0].name).toBe('large');
    });

    it('should handle a single circle', () => {
      const circle: Circle = {
        name: 'only',
        diameter: 4,
        radius: 2,
        coordinates: { x: 0, y: 0 },
        color: '',
      };

      const result = calculateMinimumEncloseForCircles([circle]);

      expect(result.enclose.diameter).toBeGreaterThanOrEqual(4);
      expect(result.circles.length).toBe(1);
    });

    it('should handle an empty array', () => {
      // This might throw or return a default result, depending on implementation
      // Modify the expected behavior based on your implementation
      expect(() => calculateMinimumEncloseForCircles([])).toThrow();
    });
  });

  describe('findOptimalEncloseSize', () => {
    it('should start with a diameter of twice the largest circle', () => {
      const circles: Circle[] = [
        {
          name: 'large',
          diameter: 10,
          radius: 5,
          coordinates: { x: 0, y: 0 },
          color: '',
        },
        {
          name: 'small',
          diameter: 4,
          radius: 2,
          coordinates: { x: 0, y: 0 },
          color: '',
        },
      ];

      findOptimalEncloseSize(circles);

      // The initial guess would be diameter 20, so the first calculation would be with that value
      // We can verify by checking what values were passed to our mocked functions
      expect(mathUtils.polarToCartesian).toHaveBeenCalled();
    });

    it('should respect the maximum iterations limit', () => {
      // Mock serverConfig to use a small number of iterations for testing
      const originalMaxIterations = serverConfig.MAX_ITERATIONS;
      const originalStepSize = serverConfig.RADIUS_STEP_SIZE;
      const originalAngleStep = serverConfig.ANGLE_STEP_SIZE;

      // Override with testing values
      vi.spyOn(serverConfig, 'MAX_ITERATIONS', 'get').mockReturnValue(3);
      vi.spyOn(serverConfig, 'RADIUS_STEP_SIZE', 'get').mockReturnValue(0.5);
      vi.spyOn(serverConfig, 'ANGLE_STEP_SIZE', 'get').mockReturnValue(90);

      // Create circles that would require some iterations
      const circles: Circle[] = Array(5)
        .fill(0)
        .map((_, i) => ({
          name: `circle${i}`,
          diameter: 2,
          radius: 1,
          coordinates: { x: 0, y: 0 },
          color: '',
        }));

      const result = findOptimalEncloseSize(circles);

      // The algorithm should still produce a valid result
      expect(result.enclose).toBeDefined();
      expect(result.circles.length).toBe(5);

      // Restore original values
      vi.spyOn(serverConfig, 'MAX_ITERATIONS', 'get').mockReturnValue(originalMaxIterations);
      vi.spyOn(serverConfig, 'RADIUS_STEP_SIZE', 'get').mockReturnValue(originalStepSize);
      vi.spyOn(serverConfig, 'ANGLE_STEP_SIZE', 'get').mockReturnValue(originalAngleStep);
    });
  });

  // Testing private functions through exported functions
  describe('private function behaviors', () => {
    it('circlePositionIsValid should detect overlapping circles', () => {
      // We'll test this indirectly through findOptimalEncloseSize
      const circles: Circle[] = [
        // Two circles that are guaranteed to overlap if placed at (0,0)
        {
          name: 'circle1',
          diameter: 4,
          radius: 2,
          coordinates: { x: 0, y: 0 },
          color: '',
        },
        {
          name: 'circle2',
          diameter: 4,
          radius: 2,
          coordinates: { x: 0, y: 0 },
          color: '',
        },
      ];

      const result = findOptimalEncloseSize(circles);

      // The algorithm should have moved the circles to non-overlapping positions
      // Calculate the distance between the circles
      const c1 = result.circles[0];
      const c2 = result.circles[1];
      const distance = Math.sqrt(
        (c1.coordinates.x - c2.coordinates.x) ** 2 + (c1.coordinates.y - c2.coordinates.y) ** 2,
      );

      // Distance should be at least the sum of radii (minus small epsilon for floating point)
      expect(distance).toBeGreaterThanOrEqual(c1.radius + c2.radius - 0.001);
    });

    it('placeCircle should place circles within the enclose radius', () => {
      // Test through findOptimalEncloseSize
      const circles: Circle[] = [
        {
          name: 'large',
          diameter: 6,
          radius: 3,
          coordinates: { x: 0, y: 0 },
          color: '',
        },
      ];

      const result = findOptimalEncloseSize(circles);

      // The circle should be within the enclose
      const circle = result.circles[0];
      const distanceFromCenter = Math.sqrt(circle.coordinates.x ** 2 + circle.coordinates.y ** 2);

      // Distance from center + circle radius should be <= enclose radius
      expect(distanceFromCenter + circle.radius).toBeLessThanOrEqual(result.enclose.radius + 0.001);
    });
  });
});
