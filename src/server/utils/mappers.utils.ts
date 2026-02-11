import { DBPreset, DBCable, DBResult } from '@/types/database.types';
import { Preset, Cable, Result } from '@/types/domain.types';

/**
 * Maps a database preset object to a domain preset object.
 * @param dbPreset - The database preset object to map
 * @returns The mapped domain preset object
 */
export function mapDBPresetToDomain(dbPreset: DBPreset): Preset {
  return {
    id: dbPreset.id,
    name: dbPreset.name,
    createdAt: new Date(dbPreset.created_at),
    updatedAt: new Date(dbPreset.updated_at),
  };
}

/**
 * Maps a database cable record to a domain Cable object.
 * @param dbCable - The database cable record to map
 * @returns A Cable domain object with transformed properties
 */
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

/**
 * Maps a database preset with its associated cables to a domain model.
 * @param preset - The database preset object to map
 * @param cables - Array of database cable objects to map
 * @returns A domain Preset object with mapped cables
 */
export function mapPresetWithCables(preset: DBPreset, cables: DBCable[]): Preset {
  return {
    ...mapDBPresetToDomain(preset),
    cables: cables.map(mapDBCableToDomain),
  };
}

/**
 * Maps a database result object to a Result domain object.
 * @param result - The database result object containing raw data from the database
 * @returns A Result object with typed properties and converted date fields
 */
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
