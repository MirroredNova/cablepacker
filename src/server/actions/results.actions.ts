'use server';

import { executeQuery } from '@/server/db/snowflake.db';
import { mapDBResultToSavedResult } from '@/server/utils/mappers.utils';
import { ApiResponse, CreateResult, Result } from '@/types/domain.types';
import { DBResult } from '@/types/database.types';

export async function saveResultAction(input: CreateResult): Promise<ApiResponse<Result>> {
  try {
    await executeQuery(
      `
      INSERT INTO RESULTS
      (ID, INPUT_CABLES, RESULT_DATA, SELECTED_PRESET_ID, CABLE_COUNT, BORE_DIAMETER, CREATED_AT)
      SELECT
        ?,
        PARSE_JSON(?),
        PARSE_JSON(?),
        ?,
        ?,
        ?,
        ?
    `,
      [
        input.id,
        JSON.stringify(input.inputCables),
        JSON.stringify(input.resultData),
        input.selectedPresetId,
        input.cableCount,
        input.boreDiameter,
        input.createdAt,
      ],
    );

    return { success: true, data: input };
  } catch (error: any) {
    console.error('Error saving calculation result:', error);
    return { success: false, error: error.message };
  }
}

export async function getResultByIdAction(resultId: string): Promise<ApiResponse<Result>> {
  try {
    const results = await executeQuery<DBResult>('SELECT * FROM RESULTS WHERE ID = ?', [resultId]);

    if (results.rows.length === 0) {
      return { success: false, error: `No result found with ID: ${resultId}` };
    }

    const data = mapDBResultToSavedResult(results.rows[0]);

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error(`Error retrieving result ${resultId}:`, error);
    return { success: false, error: error.message };
  }
}
