import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DBCable } from '@/types/database.types';
import { Cable, CreateCableInput, UpdateCableInput } from '@/types/domain.types';
import { createCableAction, updateCableAction, deleteCableAction } from '@/server/actions/cables.actions';
import { executeQuery } from '@/server/db/snowflake.db';
import { mapDBCableToDomain } from '@/server/utils/mappers.utils';

// Mock dependencies - MUST come before any imports of the modules
vi.mock('@/server/db/snowflake.db', () => ({
  executeQuery: vi.fn(),
}));

vi.mock('@/server/utils/mappers.utils', () => ({
  mapDBCableToDomain: vi.fn(),
}));

// Create a mock for adminProtectedAction that will track calls
vi.mock('@/server/auth/protect.auth', () => ({
  adminProtectedAction: vi.fn((fn) => fn),
}));

describe('Cable Actions', () => {
  // Mock data for testing
  const mockDBCable: DBCable = {
    ID: 123,
    PRESET_ID: 456,
    NAME: 'Test Cable',
    CATEGORY: 'Power',
    DIAMETER: 0.75,
    CREATED_AT: '2023-01-01T00:00:00.000Z',
    UPDATED_AT: '2023-01-01T00:00:00.000Z',
  };

  const mockCable: Cable = {
    id: 123,
    presetId: 456,
    name: 'Test Cable',
    category: 'Power',
    diameter: 0.75,
    createdAt: new Date('2023-01-01T00:00:00.000Z'),
    updatedAt: new Date('2023-01-01T00:00:00.000Z'),
  };

  // Console error spy
  let consoleErrorSpy: any;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Setup mapDBCableToDomain mock
    (mapDBCableToDomain as any).mockReturnValue(mockCable);

    // Spy on console.error
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  describe('createCableAction', () => {
    it('successfully creates a cable', async () => {
      // Mock executeQuery responses for different calls
      (executeQuery as any)
        // First call - BEGIN TRANSACTION
        .mockResolvedValueOnce({})
        // Second call - Get max ID
        .mockResolvedValueOnce({
          rows: [{ MAX_ID: 122 }],
        })
        // Third call - Insert cable
        .mockResolvedValueOnce({})
        // Fourth call - Get inserted cable
        .mockResolvedValueOnce({
          rows: [mockDBCable],
        })
        // Fifth call - COMMIT
        .mockResolvedValueOnce({});

      // Test input
      const input: CreateCableInput = {
        presetId: 456,
        name: 'Test Cable',
        diameter: 0.75,
        category: 'Power',
      };

      // Call the action
      const result = await createCableAction(input);

      // Verify the result
      expect(result).toEqual({
        success: true,
        data: mockCable,
      });

      // Verify that executeQuery was called with the correct parameters
      expect(executeQuery).toHaveBeenCalledTimes(5);
      expect(executeQuery).toHaveBeenNthCalledWith(1, 'BEGIN TRANSACTION');
      expect(executeQuery).toHaveBeenNthCalledWith(2, 'SELECT MAX(ID) AS MAX_ID FROM CABLES WHERE PRESET_ID = ?', [
        456,
      ]);
      expect(executeQuery).toHaveBeenNthCalledWith(
        3,
        'INSERT INTO CABLES (PRESET_ID, NAME, CATEGORY, DIAMETER) VALUES (?, ?, ?, ?)',
        [456, 'Test Cable', 'Power', 0.75],
      );
      expect(executeQuery).toHaveBeenNthCalledWith(
        4,
        'SELECT * FROM CABLES WHERE PRESET_ID = ? AND ID > ? ORDER BY ID ASC LIMIT 1',
        [456, 122],
      );
      expect(executeQuery).toHaveBeenNthCalledWith(5, 'COMMIT');

      // Verify that mapDBCableToDomain was called
      expect(mapDBCableToDomain).toHaveBeenCalledWith(mockDBCable);
    });

    it('handles null category correctly', async () => {
      // Mock executeQuery responses
      (executeQuery as any)
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({ rows: [{ MAX_ID: 122 }] }) // MAX ID
        .mockResolvedValueOnce({}) // INSERT
        .mockResolvedValueOnce({ rows: [{ ...mockDBCable, CATEGORY: null }] }) // SELECT
        .mockResolvedValueOnce({}); // COMMIT

      // Test input with null category
      const input: CreateCableInput = {
        presetId: 456,
        name: 'Test Cable',
        diameter: 0.75,
        category: undefined,
      };

      // Call the action
      await createCableAction(input);

      // Verify the insert parameters
      expect(executeQuery).toHaveBeenNthCalledWith(
        3,
        'INSERT INTO CABLES (PRESET_ID, NAME, CATEGORY, DIAMETER) VALUES (?, ?, ?, ?)',
        [456, 'Test Cable', null, 0.75],
      );
    });

    it('handles undefined category correctly', async () => {
      // Mock executeQuery responses
      (executeQuery as any)
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({ rows: [{ MAX_ID: 122 }] }) // MAX ID
        .mockResolvedValueOnce({}) // INSERT
        .mockResolvedValueOnce({ rows: [{ ...mockDBCable, CATEGORY: null }] }) // SELECT
        .mockResolvedValueOnce({}); // COMMIT

      // Test input with undefined category
      const input: CreateCableInput = {
        presetId: 456,
        name: 'Test Cable',
        diameter: 0.75,
      };

      // Call the action
      await createCableAction(input);

      // Verify the insert parameters
      expect(executeQuery).toHaveBeenNthCalledWith(
        3,
        'INSERT INTO CABLES (PRESET_ID, NAME, CATEGORY, DIAMETER) VALUES (?, ?, ?, ?)',
        [456, 'Test Cable', null, 0.75],
      );
    });

    it('handles no prior cables in preset', async () => {
      // Mock executeQuery responses
      (executeQuery as any)
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({ rows: [{ MAX_ID: null }] }) // MAX ID (null)
        .mockResolvedValueOnce({}) // INSERT
        .mockResolvedValueOnce({ rows: [mockDBCable] }) // SELECT
        .mockResolvedValueOnce({}); // COMMIT

      // Test input
      const input: CreateCableInput = {
        presetId: 456,
        name: 'Test Cable',
        diameter: 0.75,
        category: 'Power',
      };

      // Call the action
      const result = await createCableAction(input);

      // Verify success
      expect(result.success).toBe(true);

      // Verify it used 0 as the default max ID
      expect(executeQuery).toHaveBeenNthCalledWith(
        4,
        'SELECT * FROM CABLES WHERE PRESET_ID = ? AND ID > ? ORDER BY ID ASC LIMIT 1',
        [456, 0],
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
      const input: CreateCableInput = {
        presetId: 456,
        name: 'Test Cable',
        diameter: 0.75,
        category: 'Power',
      };

      // Call the action
      const result = await createCableAction(input);

      // Verify error response
      expect(result).toEqual({
        success: false,
        error: 'Failed to retrieve the newly inserted cable',
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
      const input: CreateCableInput = {
        presetId: 456,
        name: 'Test Cable',
        diameter: 0.75,
        category: 'Power',
      };

      // Call the action
      const result = await createCableAction(input);

      // Verify error response
      expect(result).toEqual({
        success: false,
        error: 'Database error during insert',
      });

      // Verify ROLLBACK was called
      expect(executeQuery).toHaveBeenCalledWith('ROLLBACK');

      // Verify error was logged
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error adding cable to preset:', expect.any(Error));
    });

    it('handles rollback errors', async () => {
      // Mock executeQuery to throw errors
      (executeQuery as any)
        .mockResolvedValueOnce({}) // BEGIN
        .mockRejectedValueOnce(new Error('Primary database error')) // MAX ID (error)
        .mockRejectedValueOnce(new Error('Rollback error')); // ROLLBACK (error)

      // Test input
      const input: CreateCableInput = {
        presetId: 456,
        name: 'Test Cable',
        diameter: 0.75,
        category: 'Power',
      };

      // Call the action
      const result = await createCableAction(input);

      // Verify error response has the primary error
      expect(result).toEqual({
        success: false,
        error: 'Primary database error',
      });

      // Verify both errors were logged
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error rolling back transaction:', expect.any(Error));
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error adding cable to preset:', expect.any(Error));
    });
  });

  describe('updateCableAction', () => {
    it('successfully updates a cable with all fields', async () => {
      // Mock executeQuery responses
      (executeQuery as any)
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({ rows: [{ 'number of rows updated': 1 }] }) // UPDATE
        .mockResolvedValueOnce({ rows: [mockDBCable] }) // SELECT
        .mockResolvedValueOnce({}); // COMMIT

      // Test input
      const cableId = 123;
      const updates: UpdateCableInput = {
        name: 'Updated Cable',
        category: 'Data',
        diameter: 1.0,
      };

      // Call the action
      const result = await updateCableAction(cableId, updates);

      // Verify the result
      expect(result).toEqual({
        success: true,
        data: mockCable,
      });

      // Verify executeQuery calls
      expect(executeQuery).toHaveBeenCalledTimes(4);
      expect(executeQuery).toHaveBeenNthCalledWith(1, 'BEGIN TRANSACTION');
      expect(executeQuery).toHaveBeenNthCalledWith(
        2,
        'UPDATE CABLES SET NAME = ?, CATEGORY = ?, DIAMETER = ?, UPDATED_AT = CURRENT_TIMESTAMP() WHERE ID = ?',
        ['Updated Cable', 'Data', 1.0, 123],
      );
      expect(executeQuery).toHaveBeenNthCalledWith(3, 'SELECT * FROM CABLES WHERE ID = ?', [123]);
      expect(executeQuery).toHaveBeenNthCalledWith(4, 'COMMIT');
    });

    it('successfully updates only specified fields', async () => {
      // Mock executeQuery responses
      (executeQuery as any)
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({ rows: [{ 'number of rows updated': 1 }] }) // UPDATE
        .mockResolvedValueOnce({ rows: [mockDBCable] }) // SELECT
        .mockResolvedValueOnce({}); // COMMIT

      // Test input with only name update
      const cableId = 123;
      const updates: UpdateCableInput = {
        name: 'Updated Cable',
      };

      // Call the action
      const result = await updateCableAction(cableId, updates);

      // Verify success
      expect(result.success).toBe(true);

      // Verify the update query has only the specified field
      expect(executeQuery).toHaveBeenNthCalledWith(
        2,
        'UPDATE CABLES SET NAME = ?, UPDATED_AT = CURRENT_TIMESTAMP() WHERE ID = ?',
        ['Updated Cable', 123],
      );
    });

    it('handles updates with no fields provided', async () => {
      // Test input with no updates
      const cableId = 123;
      const updates: UpdateCableInput = {};

      // Call the action
      const result = await updateCableAction(cableId, updates);

      // Verify error response
      expect(result).toEqual({
        success: false,
        error: 'No update fields provided',
      });

      // Verify no database calls were made
      expect(executeQuery).not.toHaveBeenCalled();
    });

    it('handles non-existent cable ID', async () => {
      // Mock executeQuery responses
      (executeQuery as any)
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({ rows: [{ 'number of rows updated': 0 }] }) // UPDATE (no rows)
        .mockResolvedValueOnce({}); // ROLLBACK

      // Test input
      const cableId = 999;
      const updates: UpdateCableInput = {
        name: 'Updated Cable',
      };

      // Call the action
      const result = await updateCableAction(cableId, updates);

      // Verify error response
      expect(result).toEqual({
        success: false,
        error: 'Cable with ID 999 not found',
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
      const cableId = 123;
      const updates: UpdateCableInput = {
        name: 'Updated Cable',
      };

      // Call the action
      const result = await updateCableAction(cableId, updates);

      // Verify error response
      expect(result).toEqual({
        success: false,
        error: 'Update failed',
      });

      // Verify ROLLBACK was called
      expect(executeQuery).toHaveBeenCalledWith('ROLLBACK');

      // Verify error was logged
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error updating cable 123:', expect.any(Error));
    });

    it('handles empty result from retrieving updated cable', async () => {
      // Mock executeQuery responses
      (executeQuery as any)
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({ rows: [{ 'number of rows updated': 1 }] }) // UPDATE
        .mockResolvedValueOnce({ rows: [] }) // SELECT (empty)
        .mockResolvedValueOnce({}); // ROLLBACK

      // Test input
      const cableId = 123;
      const updates: UpdateCableInput = {
        name: 'Updated Cable',
      };

      // Call the action
      const result = await updateCableAction(cableId, updates);

      // Verify error response
      expect(result).toEqual({
        success: false,
        error: 'Failed to retrieve the updated cable',
      });

      // Verify ROLLBACK was called
      expect(executeQuery).toHaveBeenNthCalledWith(4, 'ROLLBACK');
    });
  });

  describe('deleteCableAction', () => {
    it('successfully deletes a cable', async () => {
      // Mock executeQuery responses
      (executeQuery as any)
        .mockResolvedValueOnce({ rows: [{ ID: 123 }] }) // SELECT
        .mockResolvedValueOnce({}); // DELETE

      // Test input
      const cableId = 123;

      // Call the action
      const result = await deleteCableAction(cableId);

      // Verify the result
      expect(result).toEqual({
        success: true,
      });

      // Verify executeQuery calls
      expect(executeQuery).toHaveBeenCalledTimes(2);
      expect(executeQuery).toHaveBeenNthCalledWith(1, 'SELECT ID FROM CABLES WHERE ID = ?', [123]);
      expect(executeQuery).toHaveBeenNthCalledWith(2, 'DELETE FROM CABLES WHERE ID = ?', [123]);
    });

    it('handles non-existent cable ID', async () => {
      // Mock executeQuery to return empty result
      (executeQuery as any).mockResolvedValueOnce({ rows: [] }); // SELECT (empty)

      // Test input
      const cableId = 999;

      // Call the action
      const result = await deleteCableAction(cableId);

      // Verify error response
      expect(result).toEqual({
        success: false,
        error: 'Cable with ID 999 not found',
      });

      // Verify only the SELECT was called, not the DELETE
      expect(executeQuery).toHaveBeenCalledTimes(1);
      expect(executeQuery).not.toHaveBeenCalledWith('DELETE FROM CABLES WHERE ID = ?', expect.anything());
    });

    it('handles database errors during check', async () => {
      // Mock executeQuery to throw an error
      (executeQuery as any).mockRejectedValueOnce(new Error('Database error')); // SELECT (error)

      // Test input
      const cableId = 123;

      // Call the action
      const result = await deleteCableAction(cableId);

      // Verify error response
      expect(result).toEqual({
        success: false,
        error: 'Database error',
      });

      // Verify error was logged
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error deleting cable 123:', expect.any(Error));
    });

    it('handles database errors during delete', async () => {
      // Mock executeQuery responses
      (executeQuery as any)
        .mockResolvedValueOnce({ rows: [{ ID: 123 }] }) // SELECT
        .mockRejectedValueOnce(new Error('Delete failed')); // DELETE (error)

      // Test input
      const cableId = 123;

      // Call the action
      const result = await deleteCableAction(cableId);

      // Verify error response
      expect(result).toEqual({
        success: false,
        error: 'Delete failed',
      });

      // Verify error was logged
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error deleting cable 123:', expect.any(Error));
    });
  });
});
