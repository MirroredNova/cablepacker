import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DBCable, DBPreset } from '@/types/database.types';
import { Preset, CreatePresetInput, UpdatePresetInput } from '@/types/domain.types';

// Import AFTER mocking
import {
  createPresetAction,
  getAllPresetsWithCablesAction,
  updatePresetAction,
  deletePresetAction,
} from '@/server/actions/presets.actions';
import { executeQuery } from '@/server/db/snowflake.db';
import { mapDBPresetToDomain, mapPresetWithCables } from '@/server/utils/mappers.utils';

// Mock dependencies - MUST come before imports
vi.mock('@/server/db/snowflake.db', () => ({
  executeQuery: vi.fn(),
}));

vi.mock('@/server/utils/mappers.utils', () => ({
  mapDBPresetToDomain: vi.fn(),
  mapPresetWithCables: vi.fn(),
}));

vi.mock('@/server/auth/protect.auth', () => ({
  adminProtectedAction: vi.fn((fn) => fn),
}));

describe('Preset Actions', () => {
  // Mock data for testing
  const mockDBPreset: DBPreset = {
    ID: 123,
    NAME: 'Test Preset',
    CREATED_AT: '2023-01-01T00:00:00.000Z',
    UPDATED_AT: '2023-01-01T00:00:00.000Z',
  };

  const mockPreset: Preset = {
    id: 123,
    name: 'Test Preset',
    createdAt: new Date('2023-01-01T00:00:00.000Z'),
    updatedAt: new Date('2023-01-01T00:00:00.000Z'),
  };

  const mockPresetWithCables: Preset = {
    ...mockPreset,
    cables: [
      {
        id: 456,
        presetId: 123,
        name: 'Cable 1',
        category: 'Power',
        diameter: 0.75,
        createdAt: new Date('2023-01-01T00:00:00.000Z'),
        updatedAt: new Date('2023-01-01T00:00:00.000Z'),
      },
    ],
  };

  const mockDBCable: DBCable = {
    ID: 456,
    PRESET_ID: 123,
    NAME: 'Cable 1',
    CATEGORY: 'Power',
    DIAMETER: 0.75,
    CREATED_AT: '2023-01-01T00:00:00.000Z',
    UPDATED_AT: '2023-01-01T00:00:00.000Z',
  };

  // Console error spy
  let consoleErrorSpy: any;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Setup mapper mocks
    (mapDBPresetToDomain as any).mockReturnValue(mockPreset);
    (mapPresetWithCables as any).mockReturnValue(mockPresetWithCables);

    // Spy on console.error
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  describe('createPresetAction', () => {
    it('successfully creates a preset', async () => {
      // Mock executeQuery responses for different calls
      (executeQuery as any)
        // First call - BEGIN TRANSACTION
        .mockResolvedValueOnce({})
        // Second call - Get max ID
        .mockResolvedValueOnce({
          rows: [{ MAX_ID: 122 }],
        })
        // Third call - Insert preset
        .mockResolvedValueOnce({})
        // Fourth call - Get inserted preset
        .mockResolvedValueOnce({
          rows: [mockDBPreset],
        })
        // Fifth call - COMMIT
        .mockResolvedValueOnce({});

      // Test input
      const input: CreatePresetInput = {
        name: 'Test Preset',
      };

      // Call the action
      const result = await createPresetAction(input);

      // Verify the result
      expect(result).toEqual({
        success: true,
        data: mockPreset,
      });

      // Verify that executeQuery was called with the correct parameters
      expect(executeQuery).toHaveBeenCalledTimes(5);
      expect(executeQuery).toHaveBeenNthCalledWith(1, 'BEGIN TRANSACTION');
      expect(executeQuery).toHaveBeenNthCalledWith(2, 'SELECT MAX(ID) AS MAX_ID FROM PRESETS');
      expect(executeQuery).toHaveBeenNthCalledWith(3, 'INSERT INTO PRESETS (NAME) VALUES (?)', ['Test Preset']);
      expect(executeQuery).toHaveBeenNthCalledWith(
        4,
        'SELECT * FROM PRESETS WHERE ID > ? AND NAME = ? ORDER BY ID ASC LIMIT 1',
        [122, 'Test Preset'],
      );
      expect(executeQuery).toHaveBeenNthCalledWith(5, 'COMMIT');

      // Verify that mapDBPresetToDomain was called
      expect(mapDBPresetToDomain).toHaveBeenCalledWith(mockDBPreset);
    });

    it('handles no prior presets in the database', async () => {
      // Mock executeQuery responses
      (executeQuery as any)
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({ rows: [{ MAX_ID: null }] }) // MAX ID (null)
        .mockResolvedValueOnce({}) // INSERT
        .mockResolvedValueOnce({ rows: [mockDBPreset] }) // SELECT
        .mockResolvedValueOnce({}); // COMMIT

      // Test input
      const input: CreatePresetInput = {
        name: 'Test Preset',
      };

      // Call the action
      const result = await createPresetAction(input);

      // Verify success
      expect(result.success).toBe(true);

      // Verify it used 0 as the default max ID
      expect(executeQuery).toHaveBeenNthCalledWith(
        4,
        'SELECT * FROM PRESETS WHERE ID > ? AND NAME = ? ORDER BY ID ASC LIMIT 1',
        [0, 'Test Preset'],
      );
    });

    it('handles empty result from retrieval', async () => {
      // Mock executeQuery responses
      (executeQuery as any)
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({ rows: [{ MAX_ID: 122 }] }) // MAX ID
        .mockResolvedValueOnce({}) // INSERT
        .mockResolvedValueOnce({ rows: [] }) // SELECT (empty)
        .mockResolvedValueOnce({}); // ROLLBACK

      // Test input
      const input: CreatePresetInput = {
        name: 'Test Preset',
      };

      // Call the action
      const result = await createPresetAction(input);

      // Verify error response
      expect(result).toEqual({
        success: false,
        error: 'Failed to retrieve the newly created preset',
      });

      // Verify ROLLBACK was called
      expect(executeQuery).toHaveBeenNthCalledWith(5, 'ROLLBACK');
    });

    it('handles database errors during insertion', async () => {
      // Mock executeQuery to throw an error
      (executeQuery as any)
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({ rows: [{ MAX_ID: 122 }] }) // MAX ID
        .mockRejectedValueOnce(new Error('Database error during insert')) // INSERT (error)
        .mockResolvedValueOnce({}); // ROLLBACK

      // Test input
      const input: CreatePresetInput = {
        name: 'Test Preset',
      };

      // Call the action
      const result = await createPresetAction(input);

      // Verify error response
      expect(result).toEqual({
        success: false,
        error: 'Database error during insert',
      });

      // Verify ROLLBACK was called
      expect(executeQuery).toHaveBeenCalledWith('ROLLBACK');

      // Verify error was logged
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error creating preset:', expect.any(Error));
    });

    it('handles rollback errors', async () => {
      // Mock executeQuery to throw errors
      (executeQuery as any)
        .mockResolvedValueOnce({}) // BEGIN
        .mockRejectedValueOnce(new Error('Primary database error')) // MAX ID (error)
        .mockRejectedValueOnce(new Error('Rollback error')); // ROLLBACK (error)

      // Test input
      const input: CreatePresetInput = {
        name: 'Test Preset',
      };

      // Call the action
      const result = await createPresetAction(input);

      // Verify error response has the primary error
      expect(result).toEqual({
        success: false,
        error: 'Primary database error',
      });

      // Verify both errors were logged
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error rolling back transaction:', expect.any(Error));
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error creating preset:', expect.any(Error));
    });
  });

  describe('getAllPresetsWithCablesAction', () => {
    it('successfully retrieves presets with cables', async () => {
      // Mock multiple presets
      const mockDBPresets = [mockDBPreset, { ...mockDBPreset, ID: 124, NAME: 'Another Preset' }];

      // Mock cables for each preset
      const mockDBCables = [
        mockDBCable,
        { ...mockDBCable, ID: 457, NAME: 'Cable 2' },
        { ...mockDBCable, ID: 458, PRESET_ID: 124, NAME: 'Cable 3' },
      ];

      // Mock executeQuery responses
      (executeQuery as any)
        .mockResolvedValueOnce({ rows: mockDBPresets }) // Presets query
        .mockResolvedValueOnce({ rows: mockDBCables }); // Cables query

      // Set up mapper to return appropriate presets with cables
      (mapPresetWithCables as any).mockImplementation((preset: { ID: any; NAME: any }, cables: any[]) => ({
        ...mockPresetWithCables,
        id: preset.ID,
        name: preset.NAME,
        cables: cables.map((c) => ({ id: c.ID, name: c.NAME })),
      }));

      // Call the action
      const result = await getAllPresetsWithCablesAction();

      // Verify success
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);

      // Verify queries
      expect(executeQuery).toHaveBeenNthCalledWith(1, 'SELECT * FROM PRESETS ORDER BY NAME');
      expect(executeQuery).toHaveBeenNthCalledWith(
        2,
        'SELECT * FROM CABLES WHERE PRESET_ID IN (123,124) ORDER BY PRESET_ID, NAME',
        [],
      );

      // Verify mapper calls - once for each preset
      expect(mapPresetWithCables).toHaveBeenCalledTimes(2);
    });

    it('handles empty presets list', async () => {
      // Mock empty results
      (executeQuery as any).mockResolvedValueOnce({ rows: [] });

      // Call the action
      const result = await getAllPresetsWithCablesAction();

      // Verify empty array is returned
      expect(result).toEqual({
        success: true,
        data: [],
      });

      // Verify only one query was made (for presets)
      expect(executeQuery).toHaveBeenCalledTimes(1);
      expect(executeQuery).not.toHaveBeenCalledWith(expect.stringContaining('SELECT * FROM CABLES'), expect.anything());
    });

    it('handles presets with no cables', async () => {
      // Mock presets but no cables
      (executeQuery as any)
        .mockResolvedValueOnce({ rows: [mockDBPreset] }) // Presets query
        .mockResolvedValueOnce({ rows: [] }); // Empty cables result

      // Call the action
      const result = await getAllPresetsWithCablesAction();

      // Verify success
      expect(result.success).toBe(true);

      // Verify mapper was called with empty cables array
      expect(mapPresetWithCables).toHaveBeenCalledWith(mockDBPreset, []);
    });

    it('handles database errors', async () => {
      // Mock query error
      (executeQuery as any).mockRejectedValueOnce(new Error('Database connection failed'));

      // Call the action
      const result = await getAllPresetsWithCablesAction();

      // Verify error response
      expect(result).toEqual({
        success: false,
        error: 'Database connection failed',
      });

      // Verify error was logged
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching all presets with cables:', expect.any(Error));
    });
  });

  describe('updatePresetAction', () => {
    it('successfully updates a preset', async () => {
      // Mock executeQuery responses
      (executeQuery as any)
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({ rows: [{ 'number of rows updated': 1 }] }) // UPDATE
        .mockResolvedValueOnce({ rows: [mockDBPreset] }) // SELECT
        .mockResolvedValueOnce({}); // COMMIT

      // Test input
      const presetId = 123;
      const updates: UpdatePresetInput = {
        name: 'Updated Preset',
      };

      // Call the action
      const result = await updatePresetAction(presetId, updates);

      // Verify the result
      expect(result).toEqual({
        success: true,
        data: mockPreset,
      });

      // Verify executeQuery calls
      expect(executeQuery).toHaveBeenCalledTimes(4);
      expect(executeQuery).toHaveBeenNthCalledWith(1, 'BEGIN TRANSACTION');
      expect(executeQuery).toHaveBeenNthCalledWith(
        2,
        'UPDATE PRESETS SET NAME = ?, UPDATED_AT = CURRENT_TIMESTAMP() WHERE ID = ?',
        ['Updated Preset', 123],
      );
      expect(executeQuery).toHaveBeenNthCalledWith(3, 'SELECT * FROM PRESETS WHERE ID = ?', [123]);
      expect(executeQuery).toHaveBeenNthCalledWith(4, 'COMMIT');
    });

    it('handles empty name in updates', async () => {
      // Test input with empty name
      const presetId = 123;
      const updates: UpdatePresetInput = {
        name: '',
      };

      // Call the action
      const result = await updatePresetAction(presetId, updates);

      // Verify error response
      expect(result).toEqual({
        success: false,
        error: 'No update fields provided',
      });

      // Verify no database calls were made
      expect(executeQuery).not.toHaveBeenCalled();
    });

    it('handles non-existent preset ID', async () => {
      // Mock executeQuery responses
      (executeQuery as any)
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({ rows: [{ 'number of rows updated': 0 }] }) // UPDATE (no rows)
        .mockResolvedValueOnce({}); // ROLLBACK

      // Test input
      const presetId = 999;
      const updates: UpdatePresetInput = {
        name: 'Updated Preset',
      };

      // Call the action
      const result = await updatePresetAction(presetId, updates);

      // Verify error response
      expect(result).toEqual({
        success: false,
        error: 'Preset with ID 999 not found',
      });

      // Verify ROLLBACK was called
      expect(executeQuery).toHaveBeenNthCalledWith(3, 'ROLLBACK');
    });

    it('handles database errors during update', async () => {
      // Mock executeQuery to throw an error
      (executeQuery as any)
        .mockResolvedValueOnce({}) // BEGIN
        .mockRejectedValueOnce(new Error('Update failed')) // UPDATE (error)
        .mockResolvedValueOnce({}); // ROLLBACK

      // Test input
      const presetId = 123;
      const updates: UpdatePresetInput = {
        name: 'Updated Preset',
      };

      // Call the action
      const result = await updatePresetAction(presetId, updates);

      // Verify error response
      expect(result).toEqual({
        success: false,
        error: 'Update failed',
      });

      // Verify ROLLBACK was called
      expect(executeQuery).toHaveBeenCalledWith('ROLLBACK');

      // Verify error was logged
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error updating preset 123:', expect.any(Error));
    });

    it('handles empty result from retrieving updated preset', async () => {
      // Mock executeQuery responses
      (executeQuery as any)
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({ rows: [{ 'number of rows updated': 1 }] }) // UPDATE
        .mockResolvedValueOnce({ rows: [] }) // SELECT (empty)
        .mockResolvedValueOnce({}); // ROLLBACK

      // Test input
      const presetId = 123;
      const updates: UpdatePresetInput = {
        name: 'Updated Preset',
      };

      // Call the action
      const result = await updatePresetAction(presetId, updates);

      // Verify error response
      expect(result).toEqual({
        success: false,
        error: 'Failed to retrieve updated preset',
      });

      // Verify ROLLBACK was called
      expect(executeQuery).toHaveBeenNthCalledWith(4, 'ROLLBACK');
    });
  });

  describe('deletePresetAction', () => {
    it('successfully deletes a preset', async () => {
      // Mock executeQuery responses
      (executeQuery as any)
        .mockResolvedValueOnce({ rows: [{ ID: 123 }] }) // SELECT
        .mockResolvedValueOnce({}); // DELETE

      // Test input
      const presetId = 123;

      // Call the action
      const result = await deletePresetAction(presetId);

      // Verify the result
      expect(result).toEqual({
        success: true,
      });

      // Verify executeQuery calls
      expect(executeQuery).toHaveBeenCalledTimes(2);
      expect(executeQuery).toHaveBeenNthCalledWith(1, 'SELECT ID FROM PRESETS WHERE ID = ?', [123]);
      expect(executeQuery).toHaveBeenNthCalledWith(2, 'DELETE FROM PRESETS WHERE ID = ?', [123]);
    });

    it('handles non-existent preset ID', async () => {
      // Mock executeQuery to return empty result
      (executeQuery as any).mockResolvedValueOnce({ rows: [] }); // SELECT (empty)

      // Test input
      const presetId = 999;

      // Call the action
      const result = await deletePresetAction(presetId);

      // Verify error response
      expect(result).toEqual({
        success: false,
        error: 'Preset with ID 999 not found',
      });

      // Verify only the SELECT was called, not the DELETE
      expect(executeQuery).toHaveBeenCalledTimes(1);
      expect(executeQuery).not.toHaveBeenCalledWith('DELETE FROM PRESETS WHERE ID = ?', expect.anything());
    });

    it('handles database errors during check', async () => {
      // Mock executeQuery to throw an error
      (executeQuery as any).mockRejectedValueOnce(new Error('Database error')); // SELECT (error)

      // Test input
      const presetId = 123;

      // Call the action
      const result = await deletePresetAction(presetId);

      // Verify error response
      expect(result).toEqual({
        success: false,
        error: 'Database error',
      });

      // Verify error was logged
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error deleting preset 123:', expect.any(Error));
    });

    it('handles database errors during delete', async () => {
      // Mock executeQuery responses
      (executeQuery as any)
        .mockResolvedValueOnce({ rows: [{ ID: 123 }] }) // SELECT
        .mockRejectedValueOnce(new Error('Delete failed')); // DELETE (error)

      // Test input
      const presetId = 123;

      // Call the action
      const result = await deletePresetAction(presetId);

      // Verify error response
      expect(result).toEqual({
        success: false,
        error: 'Delete failed',
      });

      // Verify error was logged
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error deleting preset 123:', expect.any(Error));
    });
  });
});
