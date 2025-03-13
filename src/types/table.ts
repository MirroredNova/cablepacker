import { Cable } from './cables';

type TableRowData = {
  id: string; // Unique identifier for the row
  selectedCable: Cable | 'custom'; // Chosen cable or 'custom'
  customName?: string; // Custom cable name (if 'custom' is chosen)
  customDiameter?: number; // Custom diameter (if 'custom' is chosen)
  quantity: number; // Quantity of the cable
};

export type { TableRowData };
