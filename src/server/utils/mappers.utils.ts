import { DBPreset, DBCable, DBResult } from '@/types/database.types';
import { Preset, Cable, Result } from '@/types/domain.types';

export function mapDBPresetToDomain(dbPreset: DBPreset): Preset {
  return {
    id: dbPreset.ID,
    name: dbPreset.NAME,
    createdAt: new Date(dbPreset.CREATED_AT),
    updatedAt: new Date(dbPreset.UPDATED_AT),
  };
}

export function mapDBCableToDomain(dbCable: DBCable): Cable {
  return {
    id: dbCable.ID,
    presetId: dbCable.PRESET_ID,
    name: dbCable.NAME,
    category: dbCable.CATEGORY,
    diameter: dbCable.DIAMETER,
    createdAt: new Date(dbCable.CREATED_AT),
    updatedAt: new Date(dbCable.UPDATED_AT),
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
    id: result.ID,
    inputCables: result.INPUT_CABLES,
    resultData: result.RESULT_DATA,
    cableCount: result.CABLE_COUNT,
    boreDiameter: result.BORE_DIAMETER,
    createdAt: new Date(result.CREATED_AT),
  };
}
