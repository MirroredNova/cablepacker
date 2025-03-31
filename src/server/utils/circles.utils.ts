import { getMaxDiameter } from '@/config';
import { Circle } from '@/types/algorithm.types';
import { Cable } from '@/types/domain.types';
import { TableRowData } from '@/types/table.types';

export function mapCablesToCircles(cables: TableRowData[]): Circle[] {
  const circles: Circle[] = [];
  cables.forEach((row) => {
    const isCustom = row.selectedCable === 'custom';
    const cableType = isCustom ? row.customName || 'custom' : (row.selectedCable as Cable).name;
    const diameter = isCustom ? row.customDiameter : (row.selectedCable as Cable).diameter;

    if (!cableType || !diameter || diameter <= 0) return;
    if (diameter > getMaxDiameter()) {
      throw new RangeError('Diameter exceeds maximum limit');
    }

    const newCircle: Circle = {
      name: cableType,
      diameter,
      radius: diameter / 2,
      coordinates: { x: 0, y: 0 },
    };

    circles.push(...Array(row.quantity).fill(structuredClone(newCircle)));
  });
  return circles;
}

function generateRandomColor(): string {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

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
