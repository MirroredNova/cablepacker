'use server';

import { executeQuery } from '@/server/db/snowflake.db';
import { mapDBPresetToDomain, mapPresetWithCables } from '@/server/utils/mappers.utils';
import { DBPreset, DBCable } from '@/types/database.types';
import {
  Preset, CreatePresetInput, UpdatePresetInput, ApiResponse,
} from '@/types/domain.types';

export async function ensurePresetTableAction(): Promise<ApiResponse<null>> {
  try {
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS PRESETS (
        ID NUMBER IDENTITY(1,1) PRIMARY KEY,
        NAME VARCHAR(255) NOT NULL,
        CREATED_AT TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
        UPDATED_AT TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
      )
    `);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createPresetAction(input: CreatePresetInput): Promise<ApiResponse<Preset>> {
  try {
    // Start a transaction
    await executeQuery('BEGIN TRANSACTION');

    // Get the current maximum ID to track what we're inserting
    const maxIdResult = await executeQuery<{ MAX_ID: number | null }>(
      'SELECT MAX(ID) AS MAX_ID FROM PRESETS',
    );

    const currentMaxId = maxIdResult.rows[0]?.MAX_ID || 0;

    // Insert the new preset
    await executeQuery(
      'INSERT INTO PRESETS (NAME) VALUES (?)',
      [input.name],
    );

    // Select the newly inserted preset by finding a row with ID greater than the previous max
    const results = await executeQuery<DBPreset>(
      'SELECT * FROM PRESETS WHERE ID > ? AND NAME = ? ORDER BY ID ASC LIMIT 1',
      [currentMaxId, input.name],
    );

    if (results.rows.length === 0) {
      // Something went wrong - roll back and error out
      await executeQuery('ROLLBACK');
      throw new Error('Failed to retrieve the newly created preset');
    }

    // Commit the transaction
    await executeQuery('COMMIT');

    return {
      success: true,
      data: mapDBPresetToDomain(results.rows[0]),
    };
  } catch (error: any) {
    // Ensure we roll back the transaction on error
    try {
      await executeQuery('ROLLBACK');
    } catch (rollbackError) {
      console.error('Error rolling back transaction:', rollbackError);
    }

    console.error('Error creating preset:', error);
    return { success: false, error: error.message };
  }
}

export async function getAllPresetsWithCablesAction(): Promise<ApiResponse<Preset[]>> {
  try {
    // Get all presets
    const presetResults = await executeQuery<DBPreset>('SELECT * FROM PRESETS ORDER BY NAME');

    if (presetResults.rows.length === 0) {
      // Early return if there are no presets
      return {
        success: true,
        data: [],
      };
    }

    // Get ALL cables for ALL presets in a single query
    const presetIdsStr = presetResults.rows.map((preset) => preset.ID).join(',');
    const cablesResults = await executeQuery<DBCable>(
      `SELECT * FROM CABLES WHERE PRESET_ID IN (${presetIdsStr}) ORDER BY PRESET_ID, NAME`,
      [],
    );

    // Group cables by preset ID
    const cablesByPresetId = cablesResults.rows.reduce<Record<number, DBCable[]>>((acc, cable) => {
      const presetId = cable.PRESET_ID;
      if (!acc[presetId]) {
        acc[presetId] = [];
      }
      acc[presetId].push(cable);
      return acc;
    }, {});

    // Map presets with their cables
    const presetsWithCables = presetResults.rows.map((preset) => {
      const cableForPreset = cablesByPresetId[preset.ID] || [];
      return mapPresetWithCables(preset, cableForPreset);
    });

    return {
      success: true,
      data: presetsWithCables,
    };
  } catch (error: any) {
    console.error('Error fetching all presets with cables:', error);
    return { success: false, error: error.message };
  }
}

export async function updatePresetAction(presetId: number, updates: UpdatePresetInput): Promise<ApiResponse<Preset>> {
  try {
    if (!updates.name) {
      return { success: false, error: 'No update fields provided' };
    }

    // Begin transaction
    await executeQuery('BEGIN TRANSACTION');

    // Update the preset
    const updateResult = await executeQuery(
      'UPDATE PRESETS SET NAME = ?, UPDATED_AT = CURRENT_TIMESTAMP() WHERE ID = ?',
      [updates.name, presetId],
    );

    if (updateResult.rows[0]['number of rows updated'] === 0) {
      await executeQuery('ROLLBACK');
      return { success: false, error: `Preset with ID ${presetId} not found` };
    }

    // Fetch the updated preset
    const results = await executeQuery<DBPreset>(
      'SELECT * FROM PRESETS WHERE ID = ?',
      [presetId],
    );

    if (results.rows.length === 0) {
      await executeQuery('ROLLBACK');
      return { success: false, error: 'Failed to retrieve updated preset' };
    }

    // Commit the transaction
    await executeQuery('COMMIT');

    return {
      success: true,
      data: mapDBPresetToDomain(results.rows[0]),
    };
  } catch (error: any) {
    try {
      await executeQuery('ROLLBACK');
    } catch (rollbackError) {
      console.error('Error rolling back transaction:', rollbackError);
    }

    console.error(`Error updating preset ${presetId}:`, error);
    return { success: false, error: error.message };
  }
}

export async function deletePresetAction(presetId: number): Promise<ApiResponse<null>> {
  try {
    // First verify the preset exists
    const checkResult = await executeQuery<DBPreset>(
      'SELECT ID FROM PRESETS WHERE ID = ?',
      [presetId],
    );

    if (checkResult.rows.length === 0) {
      return { success: false, error: `Preset with ID ${presetId} not found` };
    }

    // Then delete the preset (and its cables via CASCADE constraint)
    await executeQuery(
      'DELETE FROM PRESETS WHERE ID = ?',
      [presetId],
    );

    return { success: true };
  } catch (error: any) {
    console.error(`Error deleting preset ${presetId}:`, error);
    return { success: false, error: error.message };
  }
}
