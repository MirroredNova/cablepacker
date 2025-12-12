import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getSupabaseClient } from '@/server/db/supabase.db';
import { mapDBPresetToDomain, mapPresetWithCables } from '@/server/utils/mappers.utils';
import {
  createPresetAction,
  getAllPresetsWithCablesAction,
  updatePresetAction,
  deletePresetAction,
} from '@/server/actions/presets.actions';

// Mock dependencies
vi.mock('@/server/db/supabase.db', () => ({
  getSupabaseClient: vi.fn(),
}));

vi.mock('@/server/utils/mappers.utils', () => ({
  mapDBPresetToDomain: vi.fn((preset) => ({
    id: preset.id,
    name: preset.name,
    createdAt: preset.created_at,
    updatedAt: preset.updated_at,
  })),
  mapPresetWithCables: vi.fn((preset, cables) => ({
    id: preset.id,
    name: preset.name,
    createdAt: preset.created_at,
    updatedAt: preset.updated_at,
    cables: cables.map((c: { id: any; name: any; diameter: any; category: any; preset_id: any }) => ({
      id: c.id,
      name: c.name,
      diameter: c.diameter,
      category: c.category,
      presetId: c.preset_id,
    })),
  })),
}));

vi.mock('@/server/auth/protect.auth', () => ({
  adminProtectedAction: vi.fn((fn) => fn),
}));

// Mock console.error to prevent noise during tests
vi.spyOn(console, 'error').mockImplementation(() => {});

describe('Preset Actions', () => {
  const mockDBPreset = {
    id: 1,
    name: 'Test Preset',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  };

  const mockDBCable = {
    id: 101,
    name: 'Test Cable',
    diameter: 10,
    category: 'Power',
    preset_id: 1,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  };

  let mockSupabaseClient: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create mock Supabase client with chainable methods
    mockSupabaseClient = {
      from: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn(),
    };

    (getSupabaseClient as any).mockResolvedValue(mockSupabaseClient);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('createPresetAction', () => {
    it('creates a preset successfully', async () => {
      // Arrange
      const input = { name: 'Test Preset' };

      mockSupabaseClient.single.mockResolvedValue({
        data: mockDBPreset,
        error: null,
      });

      // Act
      const result = await createPresetAction(input);

      // Assert
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('presets');
      expect(mockSupabaseClient.insert).toHaveBeenCalledWith({ name: 'Test Preset' });
      expect(mockSupabaseClient.select).toHaveBeenCalled();
      expect(mockSupabaseClient.single).toHaveBeenCalled();

      expect(mapDBPresetToDomain).toHaveBeenCalledWith(mockDBPreset);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('handles failure to retrieve newly created preset', async () => {
      // Arrange
      const input = { name: 'Test Preset' };

      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: null,
      });

      // Act
      const result = await createPresetAction(input);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to retrieve the newly created preset');
    });

    it('handles database errors', async () => {
      // Arrange
      const input = { name: 'Test Preset' };
      const mockError = { message: 'Database error', code: 'DB_ERROR' };

      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: mockError,
      });

      // Act
      const result = await createPresetAction(input);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });

  describe('getAllPresetsWithCablesAction', () => {
    it('returns empty array when no presets exist', async () => {
      // Arrange
      // First call for presets
      mockSupabaseClient.order.mockResolvedValueOnce({
        data: [],
        error: null,
      });

      // Act
      const result = await getAllPresetsWithCablesAction();

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('presets');
      expect(mockSupabaseClient.select).toHaveBeenCalledWith('*');
      expect(mockSupabaseClient.order).toHaveBeenCalledWith('name');
    });

    it('returns presets with their cables', async () => {
      // Arrange
      const mockPresets = [
        { ...mockDBPreset, id: 1 },
        { ...mockDBPreset, id: 2, name: 'Preset 2' },
      ];

      const mockCables = [
        { ...mockDBCable, id: 101, preset_id: 1 },
        { ...mockDBCable, id: 102, name: 'Cable 2', preset_id: 1 },
        { ...mockDBCable, id: 103, name: 'Cable 3', preset_id: 2 },
      ];

      // Mock the preset query
      mockSupabaseClient.order.mockResolvedValueOnce({
        data: mockPresets,
        error: null,
      });

      // Mock the cables query
      mockSupabaseClient.order
        .mockReturnValueOnce(mockSupabaseClient)
        .mockResolvedValueOnce({
          data: mockCables,
          error: null,
        });

      // Act
      const result = await getAllPresetsWithCablesAction();

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.length).toBe(2);

      // Check that cables were properly mapped to presets
      expect(mapPresetWithCables).toHaveBeenCalledTimes(2);

      // First call should include the preset and its two cables
      expect(mapPresetWithCables).toHaveBeenCalledWith(mockPresets[0], [mockCables[0], mockCables[1]]);

      // Second call should include the preset and its one cable
      expect(mapPresetWithCables).toHaveBeenCalledWith(mockPresets[1], [mockCables[2]]);

      // Verify correct API calls
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('cables');
      expect(mockSupabaseClient.in).toHaveBeenCalledWith('preset_id', [1, 2]);
    });

    it('handles database errors gracefully', async () => {
      // Arrange
      const mockError = { message: 'Database query failed', code: 'DB_ERROR' };
      mockSupabaseClient.order.mockResolvedValueOnce({
        data: null,
        error: mockError,
      });

      // Act
      const result = await getAllPresetsWithCablesAction();

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database query failed');
      expect(console.error).toHaveBeenCalledWith('Error fetching presets:', mockError);
    });
  });

  describe('updatePresetAction', () => {
    it('updates a preset successfully', async () => {
      // Arrange
      const presetId = 1;
      const updates = { name: 'Updated Preset' };

      mockSupabaseClient.single.mockResolvedValue({
        data: { ...mockDBPreset, name: 'Updated Preset' },
        error: null,
      });

      // Act
      const result = await updatePresetAction(presetId, updates);

      // Assert
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('presets');
      expect(mockSupabaseClient.update).toHaveBeenCalledWith({
        name: 'Updated Preset',
        updated_at: expect.any(String),
      });
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 1);
      expect(mockSupabaseClient.select).toHaveBeenCalled();
      expect(mockSupabaseClient.single).toHaveBeenCalled();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('returns error when no update fields provided', async () => {
      // Arrange
      const presetId = 1;
      const updates = {};

      // Act
      const result = await updatePresetAction(presetId, updates);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('No update fields provided');
      expect(mockSupabaseClient.from).not.toHaveBeenCalled();
    });

    it('handles preset not found during update', async () => {
      // Arrange
      const presetId = 999;
      const updates = { name: 'Updated Preset' };

      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: null,
      });

      // Act
      const result = await updatePresetAction(presetId, updates);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Preset with ID 999 not found');
    });

    it('handles database errors during update', async () => {
      // Arrange
      const presetId = 1;
      const updates = { name: 'Updated Preset' };
      const mockError = { message: 'Database error during update', code: 'DB_ERROR' };

      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: mockError,
      });

      // Act
      const result = await updatePresetAction(presetId, updates);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error during update');
      expect(console.error).toHaveBeenCalledWith('Error updating preset:', mockError);
    });
  });

  describe('deletePresetAction', () => {
    it('deletes a preset successfully', async () => {
      // Arrange
      const presetId = 1;

      mockSupabaseClient.single.mockResolvedValue({
        data: mockDBPreset,
        error: null,
      });

      // Act
      const result = await deletePresetAction(presetId);

      // Assert
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('presets');
      expect(mockSupabaseClient.delete).toHaveBeenCalled();
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', presetId);
      expect(mockSupabaseClient.select).toHaveBeenCalled();
      expect(mockSupabaseClient.single).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('returns error when preset not found', async () => {
      // Arrange
      const presetId = 999;

      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' },
      });

      // Act
      const result = await deletePresetAction(presetId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Preset with ID 999 not found');
    });

    it('handles database errors during deletion', async () => {
      // Arrange
      const presetId = 1;
      const mockError = { message: 'Database error during deletion', code: 'DB_ERROR' };

      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: mockError,
      });

      // Act
      const result = await deletePresetAction(presetId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error during deletion');
      expect(console.error).toHaveBeenCalledWith('Error deleting preset:', mockError);
    });
  });
});
