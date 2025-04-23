import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mapCablesToCircles, assignColorsToCircles } from '@/server/utils/circles.utils';
import { Circle } from '@/types/algorithm.types';
import { Cable } from '@/types/domain.types';
import { TableRowData } from '@/types/table.types';

// Mock the structuredClone global function to ensure it's called correctly
vi.stubGlobal(
  'structuredClone',
  vi.fn((obj) => JSON.parse(JSON.stringify(obj))),
);

// Mock the serverConfig
vi.mock('@/config', () => ({
  serverConfig: {
    MAX_DIAMETER: 10,
  },
}));

describe('Circles Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('mapCablesToCircles', () => {
    it('should convert table row data to circles', () => {
      const tableData: TableRowData[] = [
        {
          id: '1',
          selectedCable: 'custom',
          customName: 'Custom Cable',
          customDiameter: 2,
          quantity: 3,
        },
        {
          id: '2',
          selectedCable: {
            id: 123,
            name: 'Cable A',
            diameter: 4,
            presetId: 1,
          } as Cable,
          quantity: 2,
        },
      ];

      const result = mapCablesToCircles(tableData);

      // Should have 3 + 2 = 5 circles
      expect(result.length).toBe(5);

      // Check the first 3 circles (from the custom cable)
      for (let i = 0; i < 3; i += 1) {
        expect(result[i]).toEqual({
          name: 'Custom Cable',
          diameter: 2,
          radius: 1,
          coordinates: { x: 0, y: 0 },
        });
      }

      // Check the last 2 circles (from Cable A)
      for (let i = 3; i < 5; i += 1) {
        expect(result[i]).toEqual({
          name: 'Cable A',
          diameter: 4,
          radius: 2,
          coordinates: { x: 0, y: 0 },
        });
      }
    });

    it('should handle empty table data', () => {
      const result = mapCablesToCircles([]);
      expect(result).toEqual([]);
    });

    it('should use "custom" as name if customName is not provided', () => {
      const tableData: TableRowData[] = [
        {
          id: '1',
          selectedCable: 'custom',
          customDiameter: 2,
          quantity: 1,
        },
      ];

      const result = mapCablesToCircles(tableData);
      expect(result[0].name).toBe('custom');
    });

    it('should skip rows with invalid diameter', () => {
      const tableData: TableRowData[] = [
        {
          id: '1',
          selectedCable: 'custom',
          customName: 'Invalid Cable',
          customDiameter: 0, // Invalid diameter
          quantity: 3,
        },
        {
          id: '2',
          selectedCable: 'custom',
          customName: 'Missing Diameter',
          quantity: 2,
        },
        {
          id: '3',
          selectedCable: 'custom',
          customName: 'Negative Diameter',
          customDiameter: -1,
          quantity: 1,
        },
      ];

      const result = mapCablesToCircles(tableData);
      expect(result.length).toBe(0);
    });

    it('should throw an error if diameter exceeds maximum limit', () => {
      const tableData: TableRowData[] = [
        {
          id: '1',
          selectedCable: 'custom',
          customName: 'Too Large Cable',
          customDiameter: 15, // Exceeds MAX_DIAMETER of 10
          quantity: 1,
        },
      ];

      expect(() => mapCablesToCircles(tableData)).toThrow('Diameter exceeds maximum limit');
    });

    it('should create distinct circle objects for each quantity', () => {
      const tableData: TableRowData[] = [
        {
          id: '1',
          selectedCable: 'custom',
          customName: 'Custom Cable',
          customDiameter: 2,
          quantity: 2,
        },
      ];

      const result = mapCablesToCircles(tableData);
      expect(result.length).toBe(2);

      // Verify structuredClone was called to create distinct objects
      expect(structuredClone).toHaveBeenCalled();

      // Modify the first circle to verify it doesn't affect the second
      const firstCircle = result[0];
      firstCircle.coordinates.x = 10;

      // The second circle should remain unchanged
      expect(result[1].coordinates.x).toBe(0);
    });
  });

  describe('assignColorsToCircles', () => {
    it('should assign colors to circles', () => {
      const circles: Circle[] = [
        {
          name: 'Circle A',
          diameter: 2,
          radius: 1,
          coordinates: { x: 0, y: 0 },
        },
        {
          name: 'Circle B',
          diameter: 4,
          radius: 2,
          coordinates: { x: 0, y: 0 },
        },
        {
          name: 'Circle A', // Same name as the first circle
          diameter: 2,
          radius: 1,
          coordinates: { x: 0, y: 0 },
        },
      ];

      // Mock Math.random to return consistent values
      const randomSpy = vi.spyOn(Math, 'random');

      // For the first color (Circle A)
      randomSpy.mockReturnValueOnce(0.1); // R component ~= 25
      randomSpy.mockReturnValueOnce(0.2); // G component ~= 51
      randomSpy.mockReturnValueOnce(0.3); // B component ~= 76

      // For the second color (Circle B)
      randomSpy.mockReturnValueOnce(0.4); // R component ~= 102
      randomSpy.mockReturnValueOnce(0.5); // G component ~= 127
      randomSpy.mockReturnValueOnce(0.6); // B component ~= 153

      const result = assignColorsToCircles(circles);

      // Should have the same number of circles
      expect(result.length).toBe(3);

      // Each circle should have a color property
      result.forEach((circle) => {
        expect(circle).toHaveProperty('color');
        expect(typeof circle.color).toBe('string');

        // The color should be a valid hex color
        const validHexColor = /^#[0-9a-f]{6}$/i;
        expect(circle.color).toMatch(validHexColor);
      });

      // The expected hex colors based on our Math.random mocks
      const expectedFirstColor = '#19334c'; // 0.1*256 = 25.6 → 25 → 19, etc.
      const expectedSecondColor = '#668099'; // 0.4*256 = 102.4 → 102 → 66, etc.

      // Circles with the same name should have the same color
      expect(result[0].color).toBe(result[2].color);
      expect(result[0].color?.toLowerCase()).toBe(expectedFirstColor);
      expect(result[1].color?.toLowerCase()).toBe(expectedSecondColor);

      // Restore Math.random
      randomSpy.mockRestore();
    });

    it('should handle empty array', () => {
      const result = assignColorsToCircles([]);
      expect(result).toEqual([]);
    });

    it('should generate valid hex colors', () => {
      const circles: Circle[] = [
        {
          name: 'Circle A',
          diameter: 2,
          radius: 1,
          coordinates: { x: 0, y: 0 },
        },
      ];

      // Test with different random values
      const randomSpy = vi.spyOn(Math, 'random');

      // Test with 0 values (should result in #000000)
      randomSpy.mockReturnValue(0);
      let result = assignColorsToCircles([...circles]);
      expect(result[0].color).toBe('#000000');

      // Test with 1 values (should result in #ffffff)
      randomSpy.mockReturnValue(0.999);
      result = assignColorsToCircles([...circles]);
      expect(result[0].color?.toLowerCase()).toBe('#ffffff');

      // Test with mixed values
      randomSpy
        .mockReturnValueOnce(0.5) // r = 128 -> 80
        .mockReturnValueOnce(0.25) // g = 64 -> 40
        .mockReturnValueOnce(0.75); // b = 192 -> c0

      result = assignColorsToCircles([...circles]);
      expect(result[0].color?.toLowerCase()).toBe('#8040c0');

      randomSpy.mockRestore();
    });

    it('should create new objects without modifying the originals', () => {
      const original: Circle = {
        name: 'Circle A',
        diameter: 2,
        radius: 1,
        coordinates: { x: 0, y: 0 },
      };

      const circles = [original];
      const result = assignColorsToCircles(circles);

      // Should return a new array
      expect(result).not.toBe(circles);

      // Should add color without modifying original
      expect(original).not.toHaveProperty('color');
      expect(result[0]).toHaveProperty('color');
    });
  });
});
