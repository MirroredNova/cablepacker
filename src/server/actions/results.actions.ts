'use server';

import { executeQuery } from '@/server/db/snowflake.db';
import { mapDBResultToSavedResult } from '@/server/utils/mappers.utils';
import { CreateResult, Result } from '@/types/domain.types';
import { DBResult } from '@/types/database.types';
import { extractResultMetadata } from '@/server/utils/result.utils';

export const ensureResultsTableAction = async () => {
  try {
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS RESULTS (
        ID VARCHAR(12) PRIMARY KEY,
        INPUT_CABLES VARIANT NOT NULL,
        RESULT_DATA VARIANT NOT NULL,
        SELECTED_PRESET_ID NUMBER,
        CABLE_COUNT INT NOT NULL,
        BORE_DIAMETER FLOAT NOT NULL,
        CREATED_AT TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
      )
    `);
    return { success: true };
  } catch (error: any) {
    console.error('Error creating results table:', error);
    return { success: false, error: error.message };
  }
};

export async function saveResultAction(input: CreateResult, selectedPresetId: number | null): Promise<{
  success: boolean;
  resultId?: string;
  error?: string;
}> {
  try {
    const metadata = extractResultMetadata(input.resultData);

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
        input.resultData.id,
        JSON.stringify(input.inputCables),
        JSON.stringify(input.resultData),
        selectedPresetId,
        metadata.cableCount,
        metadata.boreDiameter,
        input.resultData.createdAt,
      ],
    );

    return { success: true };
  } catch (error: any) {
    console.error('Error saving calculation result:', error);
    return { success: false, error: error.message };
  }
}

export async function getResultByIdAction(resultId: string): Promise<{
  success: boolean;
  result?: Result;
  error?: string;
}> {
  try {
    const results = await executeQuery<DBResult>('SELECT * FROM RESULTS WHERE ID = ?', [resultId]);

    if (results.rows.length === 0) {
      return { success: false, error: `No result found with ID: ${resultId}` };
    }

    const result = mapDBResultToSavedResult(results.rows[0]);

    return {
      success: true,
      result,
    };
  } catch (error: any) {
    console.error(`Error retrieving result ${resultId}:`, error);
    return { success: false, error: error.message };
  }
}
