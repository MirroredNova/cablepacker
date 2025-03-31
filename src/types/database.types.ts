import { BoreResult } from '@/types/algorithm.types';
import { TableRowData } from '@/types/table.types';

export interface DBPreset {
  ID: number;
  NAME: string;
  CREATED_AT: string;
  UPDATED_AT: string;
}

export interface DBCable {
  ID: number;
  PRESET_ID: number;
  NAME: string;
  CATEGORY: string | null;
  DIAMETER: number;
  CREATED_AT: string;
  UPDATED_AT: string;
}

export interface DBResult {
  ID: string;
  INPUT_CABLES: TableRowData[];
  RESULT_DATA: BoreResult;
  CABLE_COUNT: number;
  BORE_DIAMETER: number;
  CREATED_AT: string;
  UPDATED_AT: string;
}
