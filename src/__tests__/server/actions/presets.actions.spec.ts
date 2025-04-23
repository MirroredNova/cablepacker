import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { executeQuery } from '@/server/db/snowflake.db';
import { mapDBPresetToDomain, mapPresetWithCables } from '@/server/utils/mappers.utils';
import {
  createPresetAction,
  getAllPresetsWithCablesAction,
  updatePresetAction,
  deletePresetAction,
} from '@/server/actions/presets.actions';

// Mock dependencies
vi.mock('@/server/db/snowflake.db', () => ({
  executeQuery: vi.fn(),
}));

vi.mock('@/server/utils/mappers.utils', () => ({
  mapDBPresetToDomain: vi.fn((preset) => ({
    id: preset.ID,
    name: preset.NAME,
    createdAt: preset.CREATED_AT,
    updatedAt: preset.UPDATED_AT,
  })),
  mapPresetWithCables: vi.fn((preset, cables) => ({
    id: preset.ID,
    name: preset.NAME,
    createdAt: preset.CREATED_AT,
    updatedAt: preset.UPDATED_AT,
    cables: cables.map((c: { ID: any; NAME: any; DIAMETER: any; CATEGORY: any; PRESET_ID: any }) => ({
      id: c.ID,
      name: c.NAME,
      diameter: c.DIAMETER,
      category: c.CATEGORY,
      presetId: c.PRESET_ID,
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
    ID: 1,
    NAME: 'Test Preset',
    CREATED_AT: '2023-01-01T00:00:00Z',
    UPDATED_AT: '2023-01-01T00:00:00Z',
  };

  const mockDBCable = {
    ID: 101,
    NAME: 'Test Cable',
    DIAMETER: 10,
    CATEGORY: 'Power',
    PRESET_ID: 1,
    CREATED_AT: '2023-01-01T00:00:00Z',
    UPDATED_AT: '2023-01-01T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('createPresetAction', () => {
    it('creates a preset successfully', async () => {
      // Arrange
      const input = { name: 'Test Preset' };
      const mockQueryResults = {
        rows: [mockDBPreset],
        // Add other properties that your query results have
      };

      // Set up the mock implementation for executeQuery
      (executeQuery as any).mockImplementation((query: string) => {
        if (query === 'SELECT * FROM PRESETS WHERE NAME = ? ORDER BY CREATED_AT DESC LIMIT 1') {
          return mockQueryResults;
        }
        return { rows: [] };
      });

      // Act
      const result = await createPresetAction(input);

      // Assert
      expect(executeQuery).toHaveBeenCalledWith('BEGIN TRANSACTION');
      expect(executeQuery).toHaveBeenCalledWith('INSERT INTO PRESETS (NAME) VALUES (?)', ['Test Preset']);
      expect(executeQuery).toHaveBeenCalledWith(
        'SELECT * FROM PRESETS WHERE NAME = ? ORDER BY CREATED_AT DESC LIMIT 1',
        ['Test Preset'],
      );
      expect(executeQuery).toHaveBeenCalledWith('COMMIT');

      expect(mapDBPresetToDomain).toHaveBeenCalledWith(mockDBPreset);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('handles failure to retrieve newly created preset', async () => {
      // Arrange
      const input = { name: 'Test Preset' };

      // Mock empty result set after insert
      (executeQuery as any).mockImplementation((query: string) => {
        if (query === 'SELECT * FROM PRESETS WHERE NAME = ? ORDER BY CREATED_AT DESC LIMIT 1') {
          return { rows: [] };
        }
        return { rows: [] };
      });

      // Act
      const result = await createPresetAction(input);

      // Assert
      expect(executeQuery).toHaveBeenCalledWith('ROLLBACK');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to retrieve the newly created preset');
    });

    it('handles database errors and rolls back transaction', async () => {
      // Arrange
      const input = { name: 'Test Preset' };
      const mockError = new Error('Database error');

      // Mock query execution error
      (executeQuery as any).mockImplementation((query: string) => {
        if (query === 'INSERT INTO PRESETS (NAME) VALUES (?)') {
          throw mockError;
        }
        return { rows: [] };
      });

      // Act
      const result = await createPresetAction(input);

      // Assert
      expect(executeQuery).toHaveBeenCalledWith('ROLLBACK');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });

    it('handles rollback errors', async () => {
      // Arrange
      const input = { name: 'Test Preset' };
      const mockError = new Error('Database error');
      const rollbackError = new Error('Rollback error');

      // Mock query execution error and rollback error
      (executeQuery as any).mockImplementation((query: string) => {
        if (query === 'INSERT INTO PRESETS (NAME) VALUES (?)') {
          throw mockError;
        }
        if (query === 'ROLLBACK') {
          throw rollbackError;
        }
        return { rows: [] };
      });

      // Act
      const result = await createPresetAction(input);

      // Assert
      expect(console.error).toHaveBeenCalledWith('Error rolling back transaction:', rollbackError);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });

  describe('getAllPresetsWithCablesAction', () => {
    it('returns empty array when no presets exist', async () => {
      // Arrange
      (executeQuery as any).mockResolvedValueOnce({ rows: [] });

      // Act
      const result = await getAllPresetsWithCablesAction();

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
      expect(executeQuery).toHaveBeenCalledWith('SELECT * FROM PRESETS ORDER BY NAME');
    });

    it('returns presets with their cables', async () => {
      // Arrange
      const mockPresetsResult = {
        rows: [
          { ...mockDBPreset, ID: 1 },
          { ...mockDBPreset, ID: 2, NAME: 'Preset 2' },
        ],
      };

      const mockCablesResult = {
        rows: [
          { ...mockDBCable, ID: 101, PRESET_ID: 1 },
          { ...mockDBCable, ID: 102, NAME: 'Cable 2', PRESET_ID: 1 },
          { ...mockDBCable, ID: 103, NAME: 'Cable 3', PRESET_ID: 2 },
        ],
      };

      (executeQuery as any).mockImplementation((query: string) => {
        if (query === 'SELECT * FROM PRESETS ORDER BY NAME') {
          return mockPresetsResult;
        }
        if (query.startsWith('SELECT * FROM CABLES WHERE PRESET_ID IN')) {
          return mockCablesResult;
        }
        return { rows: [] };
      });

      // Act
      const result = await getAllPresetsWithCablesAction();

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.length).toBe(2);

      // Check that cables were properly mapped to presets
      expect(mapPresetWithCables).toHaveBeenCalledTimes(2);

      // First call should include the preset and its two cables
      expect(mapPresetWithCables).toHaveBeenCalledWith(
        mockPresetsResult.rows[0],
        expect.arrayContaining([mockCablesResult.rows[0], mockCablesResult.rows[1]]),
      );

      // Second call should include the preset and its one cable
      expect(mapPresetWithCables).toHaveBeenCalledWith(
        mockPresetsResult.rows[1],
        expect.arrayContaining([mockCablesResult.rows[2]]),
      );
    });

    it('handles database errors gracefully', async () => {
      // Arrange
      const mockError = new Error('Database query failed');
      (executeQuery as any).mockRejectedValueOnce(mockError);

      // Act
      const result = await getAllPresetsWithCablesAction();

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database query failed');
      expect(console.error).toHaveBeenCalledWith('Error fetching all presets with cables:', mockError);
    });
  });

  describe('updatePresetAction', () => {
    it('updates a preset successfully', async () => {
      // Arrange
      const presetId = 1;
      const updates = { name: 'Updated Preset' };

      // Mock successful update
      (executeQuery as any).mockImplementation((query: string) => {
        if (query === 'UPDATE PRESETS SET NAME = ?, UPDATED_AT = CURRENT_TIMESTAMP() WHERE ID = ?') {
          return { rows: [{ 'number of rows updated': 1 }] };
        }
        if (query === 'SELECT * FROM PRESETS WHERE ID = ?') {
          return { rows: [{ ...mockDBPreset, NAME: 'Updated Preset' }] };
        }
        return { rows: [] };
      });

      // Act
      const result = await updatePresetAction(presetId, updates);

      // Assert
      expect(executeQuery).toHaveBeenCalledWith('BEGIN TRANSACTION');
      expect(executeQuery).toHaveBeenCalledWith(
        'UPDATE PRESETS SET NAME = ?, UPDATED_AT = CURRENT_TIMESTAMP() WHERE ID = ?',
        ['Updated Preset', 1],
      );
      expect(executeQuery).toHaveBeenCalledWith('SELECT * FROM PRESETS WHERE ID = ?', [1]);
      expect(executeQuery).toHaveBeenCalledWith('COMMIT');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('returns error when no update fields provided', async () => {
      // Arrange
      const presetId = 1;
      const updates = {}; // Empty updates

      // Act
      const result = await updatePresetAction(presetId, updates);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('No update fields provided');
      expect(executeQuery).not.toHaveBeenCalled();
    });

    it('handles preset not found during update', async () => {
      // Arrange
      const presetId = 999;
      const updates = { name: 'Updated Preset' };

      // Mock preset not found
      (executeQuery as any).mockImplementation((query: string) => {
        if (query === 'UPDATE PRESETS SET NAME = ?, UPDATED_AT = CURRENT_TIMESTAMP() WHERE ID = ?') {
          return { rows: [{ 'number of rows updated': 0 }] };
        }
        return { rows: [] };
      });

      // Act
      const result = await updatePresetAction(presetId, updates);

      // Assert
      expect(executeQuery).toHaveBeenCalledWith('ROLLBACK');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Preset with ID 999 not found');
    });

    it('handles failure to retrieve updated preset', async () => {
      // Arrange
      const presetId = 1;
      const updates = { name: 'Updated Preset' };

      // Mock update success but retrieval failure
      (executeQuery as any).mockImplementation((query: string) => {
        if (query === 'UPDATE PRESETS SET NAME = ?, UPDATED_AT = CURRENT_TIMESTAMP() WHERE ID = ?') {
          return { rows: [{ 'number of rows updated': 1 }] };
        }
        if (query === 'SELECT * FROM PRESETS WHERE ID = ?') {
          return { rows: [] }; // Empty result
        }
        return { rows: [] };
      });

      // Act
      const result = await updatePresetAction(presetId, updates);

      // Assert
      expect(executeQuery).toHaveBeenCalledWith('ROLLBACK');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to retrieve updated preset');
    });

    it('handles database errors during update', async () => {
      // Arrange
      const presetId = 1;
      const updates = { name: 'Updated Preset' };
      const mockError = new Error('Database error during update');

      // Mock database error
      (executeQuery as any).mockImplementation((query: string) => {
        if (query === 'UPDATE PRESETS SET NAME = ?, UPDATED_AT = CURRENT_TIMESTAMP() WHERE ID = ?') {
          throw mockError;
        }
        return { rows: [] };
      });

      // Act
      const result = await updatePresetAction(presetId, updates);

      // Assert
      expect(executeQuery).toHaveBeenCalledWith('ROLLBACK');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error during update');
      expect(console.error).toHaveBeenCalledWith(`Error updating preset ${presetId}:`, mockError);
    });
  });

  describe('deletePresetAction', () => {
    it('deletes a preset successfully', async () => {
      // Arrange
      const presetId = 1;

      // Mock preset exists
      (executeQuery as any).mockImplementation((query: string) => {
        if (query === 'SELECT ID FROM PRESETS WHERE ID = ?') {
          return { rows: [{ ID: presetId }] };
        }
        return { rows: [] };
      });

      // Act
      const result = await deletePresetAction(presetId);

      // Assert
      expect(executeQuery).toHaveBeenCalledWith('SELECT ID FROM PRESETS WHERE ID = ?', [presetId]);
      expect(executeQuery).toHaveBeenCalledWith('DELETE FROM PRESETS WHERE ID = ?', [presetId]);
      expect(result.success).toBe(true);
    });

    it('returns error when preset not found', async () => {
      // Arrange
      const presetId = 999;

      // Mock preset not found
      (executeQuery as any).mockImplementation(() => ({ rows: [] }));

      // Act
      const result = await deletePresetAction(presetId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Preset with ID 999 not found');
      expect(executeQuery).not.toHaveBeenCalledWith('DELETE FROM PRESETS WHERE ID = ?', [presetId]);
    });

    it('handles database errors during deletion', async () => {
      // Arrange
      const presetId = 1;
      const mockError = new Error('Database error during deletion');

      // Mock preset exists but delete fails
      (executeQuery as any).mockImplementation((query: string) => {
        if (query === 'SELECT ID FROM PRESETS WHERE ID = ?') {
          return { rows: [{ ID: presetId }] };
        }
        if (query === 'DELETE FROM PRESETS WHERE ID = ?') {
          throw mockError;
        }
        return { rows: [] };
      });

      // Act
      const result = await deletePresetAction(presetId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error during deletion');
      expect(console.error).toHaveBeenCalledWith(`Error deleting preset ${presetId}:`, mockError);
    });
  });
});
