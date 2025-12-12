'use server';

import { adminProtectedAction } from '@/server/auth/protect.auth';
import { getSupabaseClient } from '@/server/db/supabase.db';
import { mapDBCableToDomain } from '@/server/utils/mappers.utils';
import { DBCable } from '@/types/database.types';
import { ApiResponse, Cable, CreateCableInput, UpdateCableInput } from '@/types/domain.types';

export const createCableAction = adminProtectedAction(async (input: CreateCableInput): Promise<ApiResponse<Cable>> => {
  try {
    const { presetId, name, diameter, category } = input;

    const client = await getSupabaseClient();

    // Insert the cable and return the created record
    const { data, error } = await client
      .from('cables')
      .insert({
        preset_id: presetId,
        name,
        category: category || null,
        diameter,
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting cable:', error);
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error('Failed to retrieve the newly inserted cable');
    }

    return {
      success: true,
      data: mapDBCableToDomain(data as DBCable),
    };
  } catch (error: any) {
    console.error('Error adding cable to preset:', error);
    return { success: false, error: error.message };
  }
});

export const updateCableAction = adminProtectedAction(
  async (cableId: number, updates: UpdateCableInput): Promise<ApiResponse<Cable>> => {
    try {
      const updateData: Partial<DBCable> = {};

      // Build dynamic update object
      if (updates.name !== undefined) {
        updateData.name = updates.name;
      }

      if (updates.category !== undefined) {
        updateData.category = updates.category;
      }

      if (updates.diameter !== undefined) {
        updateData.diameter = updates.diameter;
      }

      if (Object.keys(updateData).length === 0) {
        return { success: false, error: 'No update fields provided' };
      }

      // Add timestamp update
      updateData.updated_at = new Date().toISOString();

      const client = await getSupabaseClient();

      // Perform the update and return the updated record
      const { data, error } = await client
        .from('cables')
        .update(updateData)
        .eq('id', cableId)
        .select()
        .single();

      if (error) {
        console.error('Error updating cable:', error);
        return { success: false, error: error.message };
      }

      if (!data) {
        return { success: false, error: `Cable with ID ${cableId} not found` };
      }

      return {
        success: true,
        data: mapDBCableToDomain(data as DBCable),
      };
    } catch (error: any) {
      console.error(`Error updating cable ${cableId}:`, error);
      return { success: false, error: error.message };
    }
  },
);

export const deleteCableAction = adminProtectedAction(async (cableId: number): Promise<ApiResponse<null>> => {
  try {
    const client = await getSupabaseClient();

    // Delete the cable (will return the deleted row if successful)
    const { error } = await client
      .from('cables')
      .delete()
      .eq('id', cableId)
      .select()
      .single();

    if (error) {
      // Check if it's a "not found" error
      if (error.code === 'PGRST116') {
        return { success: false, error: `Cable with ID ${cableId} not found` };
      }
      console.error('Error deleting cable:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: null };
  } catch (error: any) {
    console.error(`Error deleting cable ${cableId}:`, error);
    return { success: false, error: error.message };
  }
});
