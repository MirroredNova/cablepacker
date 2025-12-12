import { DBPreset, DBCable, DBResult } from '@/types/database.types';
import { Preset, Cable, Result } from '@/types/domain.types';

export function mapDBPresetToDomain(dbPreset: DBPreset): Preset {
  return {
    id: dbPreset.id,
    name: dbPreset.name,
    createdAt: new Date(dbPreset.created_at),
    updatedAt: new Date(dbPreset.updated_at),
  };
}

export function mapDBCableToDomain(dbCable: DBCable): Cable {
  return {
    id: dbCable.id,
    presetId: dbCable.preset_id,
    name: dbCable.name,
    category: dbCable.category,
    diameter: dbCable.diameter,
    createdAt: new Date(dbCable.created_at),
    updatedAt: new Date(dbCable.updated_at),
  };
}

export function mapPresetWithCables(preset: DBPreset, cables: DBCable[]): Preset {
  return {
    ...mapDBPresetToDomain(preset),
    cables: cables.map(mapDBCableToDomain),
  };
}

export function mapDBResultToSavedResult(result: DBResult): Result {
  return {
    id: result.id,
    inputCables: result.input_cables,
    resultData: result.result_data,
    selectedPresetId: result.selected_preset_id,
    cableCount: result.cable_count,
    boreDiameter: result.bore_diameter,
    createdAt: new Date(result.created_at),
  };
}
