'use server';

import { adminProtectedAction } from '@/server/auth/protect.auth';
import { getSupabaseClient } from '@/server/db/supabase.db';
import { mapDBPresetToDomain, mapPresetWithCables } from '@/server/utils/mappers.utils';
import { DBCable, DBPreset } from '@/types/database.types';
import { ApiResponse, CreatePresetInput, Preset, UpdatePresetInput } from '@/types/domain.types';

export const createPresetAction = adminProtectedAction(
  async (input: CreatePresetInput): Promise<ApiResponse<Preset>> => {
    try {
      const client = await getSupabaseClient();

      // Insert the new preset and return it
      const { data, error } = await client
        .from('presets')
        .insert({ name: input.name })
        .select()
        .single();

      if (error) {
        console.error('Error inserting preset:', error);
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error('Failed to retrieve the newly created preset');
      }

      return {
        success: true,
        data: mapDBPresetToDomain(data as DBPreset),
      };
    } catch (error: any) {
      console.error('Error creating preset:', error);
      return { success: false, error: error.message };
    }
  },
);

export async function getAllPresetsWithCablesAction(): Promise<ApiResponse<Preset[]>> {
  try {
    const client = await getSupabaseClient();

    // Fetch all presets ordered by name
    const { data: presets, error: presetsError } = await client
      .from('presets')
      .select('*')
      .order('name');

    if (presetsError) {
      console.error('Error fetching presets:', presetsError);
      throw new Error(presetsError.message);
    }

    if (!presets || presets.length === 0) {
      return {
        success: true,
        data: [],
      };
    }

    // Get all preset IDs
    const presetIds = presets.map((preset) => preset.id);

    // Fetch all cables for these presets
    const { data: cables, error: cablesError } = await client
      .from('cables')
      .select('*')
      .in('preset_id', presetIds)
      .order('preset_id')
      .order('name');

    if (cablesError) {
      console.error('Error fetching cables:', cablesError);
      throw new Error(cablesError.message);
    }

    // Group cables by preset ID
    const cablesByPresetId = (cables || []).reduce<Record<number, DBCable[]>>((acc, cable) => {
      const presetId = cable.preset_id;
      if (!acc[presetId]) {
        acc[presetId] = [];
      }
      acc[presetId].push(cable as DBCable);
      return acc;
    }, {});

    // Map presets with their cables
    const presetsWithCables = presets.map((preset) => {
      const cableForPreset = cablesByPresetId[preset.id] || [];
      return mapPresetWithCables(preset as DBPreset, cableForPreset);
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

export const updatePresetAction = adminProtectedAction(
  async (presetId: number, updates: UpdatePresetInput): Promise<ApiResponse<Preset>> => {
    try {
      if (!updates.name) {
        return { success: false, error: 'No update fields provided' };
      }

      const client = await getSupabaseClient();

      // Update the preset and return the updated record
      const { data, error } = await client
        .from('presets')
        .update({
          name: updates.name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', presetId)
        .select()
        .single();

      if (error) {
        console.error('Error updating preset:', error);
        return { success: false, error: error.message };
      }

      if (!data) {
        return { success: false, error: `Preset with ID ${presetId} not found` };
      }

      return {
        success: true,
        data: mapDBPresetToDomain(data as DBPreset),
      };
    } catch (error: any) {
      console.error(`Error updating preset ${presetId}:`, error);
      return { success: false, error: error.message };
    }
  },
);

export const deletePresetAction = adminProtectedAction(async (presetId: number): Promise<ApiResponse<null>> => {
  try {
    const client = await getSupabaseClient();

    // Delete the preset (cables will be deleted via CASCADE constraint)
    const { error } = await client
      .from('presets')
      .delete()
      .eq('id', presetId)
      .select()
      .single();

    if (error) {
      // Check if it's a "not found" error
      if (error.code === 'PGRST116') {
        return { success: false, error: `Preset with ID ${presetId} not found` };
      }
      console.error('Error deleting preset:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: null };
  } catch (error: any) {
    console.error(`Error deleting preset ${presetId}:`, error);
    return { success: false, error: error.message };
  }
});
