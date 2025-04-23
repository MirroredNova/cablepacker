'use server';

import { adminProtectedAction } from '@/server/auth/protect.auth';
import { executeQuery } from '@/server/db/snowflake.db';
import { mapDBCableToDomain } from '@/server/utils/mappers.utils';
import { DBCable } from '@/types/database.types';
import { ApiResponse, Cable, CreateCableInput, UpdateCableInput } from '@/types/domain.types';

export const createCableAction = adminProtectedAction(async (input: CreateCableInput): Promise<ApiResponse<Cable>> => {
  try {
    const { presetId, name, diameter, category } = input;

    // Begin transaction
    await executeQuery('BEGIN TRANSACTION');

    // Get current max ID to track the insertion
    const maxIdResult = await executeQuery<{ MAX_ID: number | null }>(
      'SELECT MAX(ID) AS MAX_ID FROM CABLES WHERE PRESET_ID = ?',
      [presetId],
    );

    const currentMaxId = maxIdResult.rows[0]?.MAX_ID || 0;

    // Insert the cable
    await executeQuery('INSERT INTO CABLES (PRESET_ID, NAME, CATEGORY, DIAMETER) VALUES (?, ?, ?, ?)', [
      presetId,
      name,
      category || null,
      diameter,
    ]);

    // Get the newly inserted cable
    const results = await executeQuery<DBCable>(
      'SELECT * FROM CABLES WHERE PRESET_ID = ? AND ID > ? ORDER BY ID ASC LIMIT 1',
      [presetId, currentMaxId],
    );

    if (results.rows.length === 0) {
      await executeQuery('ROLLBACK');
      throw new Error('Failed to retrieve the newly inserted cable');
    }

    // Commit the transaction
    await executeQuery('COMMIT');

    return {
      success: true,
      data: mapDBCableToDomain(results.rows[0]),
    };
  } catch (error: any) {
    // Ensure we roll back the transaction on error
    try {
      await executeQuery('ROLLBACK');
    } catch (rollbackError) {
      console.error('Error rolling back transaction:', rollbackError);
    }

    console.error('Error adding cable to preset:', error);
    return { success: false, error: error.message };
  }
});

export const updateCableAction = adminProtectedAction(
  async (cableId: number, updates: UpdateCableInput): Promise<ApiResponse<Cable>> => {
    try {
      const updateFields: string[] = [];
      const values: any[] = [];

      // Build dynamic update fields
      if (updates.name !== undefined) {
        updateFields.push('NAME = ?');
        values.push(updates.name);
      }

      if (updates.category !== undefined) {
        updateFields.push('CATEGORY = ?');
        values.push(updates.category);
      }

      if (updates.diameter !== undefined) {
        updateFields.push('DIAMETER = ?');
        values.push(updates.diameter);
      }

      if (updateFields.length === 0) {
        return { success: false, error: 'No update fields provided' };
      }

      // Add timestamp update
      updateFields.push('UPDATED_AT = CURRENT_TIMESTAMP()');

      // Start transaction
      await executeQuery('BEGIN TRANSACTION');

      // Perform the update
      const query = `UPDATE CABLES SET ${updateFields.join(', ')} WHERE ID = ?`;
      const updateResult = await executeQuery(query, [...values, cableId]);

      if (updateResult.rows[0]['number of rows updated'] === 0) {
        await executeQuery('ROLLBACK');
        return { success: false, error: `Cable with ID ${cableId} not found` };
      }

      // Get the updated cable
      const results = await executeQuery<DBCable>('SELECT * FROM CABLES WHERE ID = ?', [cableId]);

      if (results.rows.length === 0) {
        await executeQuery('ROLLBACK');
        return { success: false, error: 'Failed to retrieve the updated cable' };
      }

      // Commit the transaction
      await executeQuery('COMMIT');

      return {
        success: true,
        data: mapDBCableToDomain(results.rows[0]),
      };
    } catch (error: any) {
      // Ensure we roll back the transaction on error
      try {
        await executeQuery('ROLLBACK');
      } catch (rollbackError) {
        console.error('Error rolling back transaction:', rollbackError);
      }

      console.error(`Error updating cable ${cableId}:`, error);
      return { success: false, error: error.message };
    }
  },
);

export const deleteCableAction = adminProtectedAction(async (cableId: number): Promise<ApiResponse<null>> => {
  try {
    // First verify the cable exists
    const checkResult = await executeQuery<{ ID: number }>('SELECT ID FROM CABLES WHERE ID = ?', [cableId]);

    if (checkResult.rows.length === 0) {
      return { success: false, error: `Cable with ID ${cableId} not found` };
    }

    // Then delete it
    await executeQuery('DELETE FROM CABLES WHERE ID = ?', [cableId]);

    return { success: true };
  } catch (error: any) {
    console.error(`Error deleting cable ${cableId}:`, error);
    return { success: false, error: error.message };
  }
});
