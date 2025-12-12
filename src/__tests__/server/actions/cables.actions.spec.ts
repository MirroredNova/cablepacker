import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getSupabaseClient } from '@/server/db/supabase.db';
import { mapDBCableToDomain } from '@/server/utils/mappers.utils';
import { createCableAction, updateCableAction, deleteCableAction } from '@/server/actions/cables.actions';
import { DBCable } from '@/types/database.types';

// Mock dependencies
vi.mock('@/server/db/supabase.db', () => ({
  getSupabaseClient: vi.fn(),
}));

vi.mock('@/server/utils/mappers.utils', () => ({
  mapDBCableToDomain: vi.fn((cable) => ({
    id: cable.id,
    name: cable.name,
    presetId: cable.preset_id,
    category: cable.category,
    diameter: cable.diameter,
    createdAt: cable.created_at,
    updatedAt: cable.updated_at,
  })),
}));

vi.mock('@/server/auth/protect.auth', () => ({
  adminProtectedAction: vi.fn((fn) => fn),
}));

// Mock console.error to prevent noise during tests
vi.spyOn(console, 'error').mockImplementation(() => {});

describe('Cable Actions', () => {
  const mockDBCable: DBCable = {
    id: 101,
    name: 'Test Cable',
    preset_id: 1,
    category: 'Power',
    diameter: 10,
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
      single: vi.fn(),
    };

    (getSupabaseClient as any).mockResolvedValue(mockSupabaseClient);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('createCableAction', () => {
    it('creates a cable successfully', async () => {
      // Arrange
      const input = {
        presetId: 1,
        name: 'Test Cable',
        diameter: 10,
        category: 'Power',
      };

      mockSupabaseClient.single.mockResolvedValue({
        data: mockDBCable,
        error: null,
      });

      // Act
      const result = await createCableAction(input);

      // Assert
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('cables');
      expect(mockSupabaseClient.insert).toHaveBeenCalledWith({
        preset_id: 1,
        name: 'Test Cable',
        category: 'Power',
        diameter: 10,
      });
      expect(mockSupabaseClient.select).toHaveBeenCalled();
      expect(mockSupabaseClient.single).toHaveBeenCalled();

      expect(mapDBCableToDomain).toHaveBeenCalledWith(mockDBCable);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('handles null category', async () => {
      // Arrange
      const input = {
        presetId: 1,
        name: 'Test Cable',
        diameter: 10,
        category: undefined,
      };

      const mockCableWithNullCategory = {
        ...mockDBCable,
        category: null,
      };

      mockSupabaseClient.single.mockResolvedValue({
        data: mockCableWithNullCategory,
        error: null,
      });

      // Act
      const result = await createCableAction(input);

      // Assert
      expect(mockSupabaseClient.insert).toHaveBeenCalledWith({
        preset_id: 1,
        name: 'Test Cable',
        category: null,
        diameter: 10,
      });
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('handles failure to retrieve newly inserted cable', async () => {
      // Arrange
      const input = {
        presetId: 1,
        name: 'Test Cable',
        diameter: 10,
      };

      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: null,
      });

      // Act
      const result = await createCableAction(input);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to retrieve the newly inserted cable');
    });

    it('handles database errors', async () => {
      // Arrange
      const input = {
        presetId: 1,
        name: 'Test Cable',
        diameter: 10,
      };

      const mockError = { message: 'Database error', code: 'DB_ERROR' };

      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: mockError,
      });

      // Act
      const result = await createCableAction(input);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
      expect(console.error).toHaveBeenCalledWith('Error inserting cable:', mockError);
    });
  });

  describe('updateCableAction', () => {
    it('updates a cable with all fields successfully', async () => {
      // Arrange
      const cableId = 101;
      const updates = {
        name: 'Updated Cable',
        category: 'Updated Category',
        diameter: 15,
      };

      const updatedCable = {
        ...mockDBCable,
        name: 'Updated Cable',
        category: 'Updated Category',
        diameter: 15,
      };

      mockSupabaseClient.single.mockResolvedValue({
        data: updatedCable,
        error: null,
      });

      // Act
      const result = await updateCableAction(cableId, updates);

      // Assert
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('cables');
      expect(mockSupabaseClient.update).toHaveBeenCalledWith({
        name: 'Updated Cable',
        category: 'Updated Category',
        diameter: 15,
        updated_at: expect.any(String),
      });
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 101);
      expect(mockSupabaseClient.select).toHaveBeenCalled();
      expect(mockSupabaseClient.single).toHaveBeenCalled();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('updates a cable with partial fields', async () => {
      // Arrange
      const cableId = 101;
      const updates = {
        name: 'Updated Cable',
      };

      const updatedCable = {
        ...mockDBCable,
        name: 'Updated Cable',
      };

      mockSupabaseClient.single.mockResolvedValue({
        data: updatedCable,
        error: null,
      });

      // Act
      const result = await updateCableAction(cableId, updates);

      // Assert
      expect(mockSupabaseClient.update).toHaveBeenCalledWith({
        name: 'Updated Cable',
        updated_at: expect.any(String),
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('returns error when no update fields provided', async () => {
      // Arrange
      const cableId = 101;
      const updates = {};

      // Act
      const result = await updateCableAction(cableId, updates);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('No update fields provided');
      expect(mockSupabaseClient.from).not.toHaveBeenCalled();
    });

    it('handles cable not found during update', async () => {
      // Arrange
      const cableId = 999;
      const updates = { name: 'Updated Cable' };

      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: null,
      });

      // Act
      const result = await updateCableAction(cableId, updates);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Cable with ID 999 not found');
    });

    it('handles database errors during update', async () => {
      // Arrange
      const cableId = 101;
      const updates = { name: 'Updated Cable' };
      const mockError = { message: 'Database error during update', code: 'DB_ERROR' };

      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: mockError,
      });

      // Act
      const result = await updateCableAction(cableId, updates);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error during update');
      expect(console.error).toHaveBeenCalledWith('Error updating cable:', mockError);
    });
  });

  describe('deleteCableAction', () => {
    it('deletes a cable successfully', async () => {
      // Arrange
      const cableId = 101;

      mockSupabaseClient.single.mockResolvedValue({
        data: mockDBCable,
        error: null,
      });

      // Act
      const result = await deleteCableAction(cableId);

      // Assert
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('cables');
      expect(mockSupabaseClient.delete).toHaveBeenCalled();
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', cableId);
      expect(mockSupabaseClient.select).toHaveBeenCalled();
      expect(mockSupabaseClient.single).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('returns error when cable not found', async () => {
      // Arrange
      const cableId = 999;

      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' },
      });

      // Act
      const result = await deleteCableAction(cableId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Cable with ID 999 not found');
    });

    it('handles database errors during deletion', async () => {
      // Arrange
      const cableId = 101;
      const mockError = { message: 'Database error during deletion', code: 'DB_ERROR' };

      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: mockError,
      });

      // Act
      const result = await deleteCableAction(cableId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error during deletion');
      expect(console.error).toHaveBeenCalledWith('Error deleting cable:', mockError);
    });
  });
});
