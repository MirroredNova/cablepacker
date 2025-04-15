import { Cable } from '@/types/domain.types';

export type TableError = {
  message: string;
  code?: number;
  timeout?: number;
};

export type TableRowData = {
  id: string;
  selectedCable: Cable | 'custom';
  customName?: string;
  customDiameter?: number;
  quantity: number;
};
