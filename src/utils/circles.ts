import { CircleStruct } from '@/types/algorithm';
import { Cable } from '@/types/cables';
import { TableRowData } from '@/types/table';

export function mapCablesToCircles(cables: TableRowData[]): CircleStruct[] {
  const circles: CircleStruct[] = [];
  cables.forEach((row) => {
    const isCustom = row.selectedCable === 'custom';
    const cableType = isCustom ? row.customName || 'custom' : (row.selectedCable as Cable).name;
    const diameter = isCustom ? row.customDiameter : (row.selectedCable as Cable).diameter;

    if (!cableType || !diameter || diameter <= 0) return;

    const newCircle: CircleStruct = {
      name: cableType,
      diameter,
      radius: diameter / 2,
      coordinates: { x: 0, y: 0 },
    };

    circles.push(...Array(row.quantity).fill(structuredClone(newCircle)));
  });
  return circles;
}
