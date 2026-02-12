import { BoreResult } from '@/types/algorithm.types';
import { TableRowData } from '@/types/table.types';

// PostgreSQL/Supabase database types
export interface DBPreset {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface DBCable {
  id: number;
  preset_id: number;
  name: string;
  category: string | null;
  diameter: number;
  created_at: string;
  updated_at: string;
}

export interface DBResult {
  id: string;
  input_cables: TableRowData[];
  result_data: BoreResult;
  selected_preset_id: number | null;
  cable_count: number;
  bore_diameter: number;
  created_at: string;
}
