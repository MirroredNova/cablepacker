'use server';

import { getSupabaseClient } from '@/server/db/supabase.db';
import { mapDBResultToSavedResult } from '@/server/utils/mappers.utils';
import { ApiResponse, CreateResult, Result } from '@/types/domain.types';
import { DBResult } from '@/types/database.types';

export async function saveResultAction(input: CreateResult): Promise<ApiResponse<Result>> {
  try {
    const client = await getSupabaseClient();

    // Insert the result
    const { data, error } = await client
      .from('results')
      .insert({
        id: input.id,
        input_cables: input.inputCables,
        result_data: input.resultData,
        selected_preset_id: input.selectedPresetId,
        cable_count: input.cableCount,
        bore_diameter: input.boreDiameter,
        created_at: input.createdAt,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving result:', error);
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error('Failed to save result');
    }

    return { success: true, data: mapDBResultToSavedResult(data as DBResult) };
  } catch (error: any) {
    console.error('Error saving calculation result:', error);
    return { success: false, error: error.message };
  }
}

export async function getResultByIdAction(resultId: string): Promise<ApiResponse<Result>> {
  try {
    const client = await getSupabaseClient();

    const { data, error } = await client
      .from('results')
      .select('*')
      .eq('id', resultId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { success: false, error: `No result found with ID: ${resultId}` };
      }
      console.error('Error fetching result:', error);
      throw new Error(error.message);
    }

    if (!data) {
      return { success: false, error: `No result found with ID: ${resultId}` };
    }

    return {
      success: true,
      data: mapDBResultToSavedResult(data as DBResult),
    };
  } catch (error: any) {
    console.error(`Error retrieving result ${resultId}:`, error);
    return { success: false, error: error.message };
  }
}
