import { serverConfig } from '@/config';
import { Circle } from '@/types/algorithm.types';
import { Cable } from '@/types/domain.types';
import { TableRowData } from '@/types/table.types';

/**
 * Map the input cables from the table to a list of circles for the algorithm
 * @param cables The list of cables from the input table, including custom cables
 * @returns A list of Circle objects representing each cable to be arranged
 */
export function mapCablesToCircles(cables: TableRowData[]): Circle[] {
  const circles: Circle[] = [];
  cables.forEach((row) => {
    const isCustom = row.selectedCable === 'custom';
    const cableType = isCustom ? row.customName || 'custom' : (row.selectedCable as Cable).name;
    const diameter = isCustom ? row.customDiameter : (row.selectedCable as Cable).diameter;

    if (!cableType || !diameter || diameter <= 0) return;
    if (diameter > serverConfig.MAX_DIAMETER) {
      throw new RangeError('Diameter exceeds maximum limit');
    }

    const baseCircle: Circle = {
      name: cableType,
      diameter,
      radius: diameter / 2,
      coordinates: { x: 0, y: 0 },
    };

    // Create a new instance for each quantity
    for (let i = 0; i < row.quantity; i += 1) {
      circles.push(structuredClone(baseCircle));
    }
  });
  return circles;
}

/**
 * Generate a random hex color string
 * @returns A random color in hex format (e.g., #a1b2c3)
 */
function generateRandomColor(): string {
  // Generate values between 0-255 for RGB
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);

  // Convert to hex string and ensure 2 digits with padStart
  const toHex = (num: number) => num.toString(16).padStart(2, '0');

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Assign colors to circles based on their type (name). Circles with the same name get the same color.
 * @param circles The list of circles to assign colors to
 * @returns A new list of circles with colors assigned
 */
export function assignColorsToCircles(circles: Circle[]): Circle[] {
  const colorMap = new Map<string, string>();

  return circles.map((circle) => {
    if (!colorMap.has(circle.name)) {
      colorMap.set(circle.name, generateRandomColor());
    }

    return {
      ...circle,
      color: colorMap.get(circle.name),
    };
  });
}
