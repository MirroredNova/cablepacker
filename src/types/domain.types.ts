import { TableRowData } from './table.types';
import { BoreResult } from './algorithm.types';

export interface Cable {
  id: number;
  presetId: number;
  name: string;
  category: string | null;
  diameter: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Preset {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  cables?: Cable[];
}

export interface Result {
  id: string;
  inputCables: TableRowData[];
  resultData: BoreResult
  cableCount: number;
  boreDiameter: number;
  createdAt: Date;
}

// For create/update operations
export interface CreateCableInput {
  presetId: number;
  name: string;
  category?: string;
  diameter: number;
}

export interface CreatePresetInput {
  name: string;
}

export interface UpdateCableInput {
  name?: string;
  category?: string;
  diameter?: number;
}

export interface UpdatePresetInput {
  name?: string;
}

export interface CreateResult {
  inputCables: TableRowData[];
  resultData: BoreResult;
}
