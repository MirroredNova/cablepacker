import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { executeQuery } from '@/server/db/snowflake.db';
import { mapDBCableToDomain } from '@/server/utils/mappers.utils';
import { createCableAction, updateCableAction, deleteCableAction } from '@/server/actions/cables.actions';
import { DBCable } from '@/types/database.types';

// Mock dependencies
vi.mock('@/server/db/snowflake.db', () => ({
  executeQuery: vi.fn(),
}));

vi.mock('@/server/utils/mappers.utils', () => ({
  mapDBCableToDomain: vi.fn((cable) => ({
    id: cable.ID,
    name: cable.NAME,
    presetId: cable.PRESET_ID,
    category: cable.CATEGORY,
    diameter: cable.DIAMETER,
    createdAt: cable.CREATED_AT,
    updatedAt: cable.UPDATED_AT,
  })),
}));

vi.mock('@/server/auth/protect.auth', () => ({
  adminProtectedAction: vi.fn((fn) => fn),
}));

// Mock console.error to prevent noise during tests
vi.spyOn(console, 'error').mockImplementation(() => {});

describe('Cable Actions', () => {
  const mockDBCable: DBCable = {
    ID: 101,
    NAME: 'Test Cable',
    PRESET_ID: 1,
    CATEGORY: 'Power',
    DIAMETER: 10,
    CREATED_AT: '2023-01-01T00:00:00Z',
    UPDATED_AT: '2023-01-01T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
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

      const mockQueryResults = {
        rows: [mockDBCable],
      };

      // Set up mock implementation for executeQuery
      (executeQuery as any).mockImplementation((query: string) => {
        if (query === 'SELECT * FROM CABLES WHERE PRESET_ID = ? ORDER BY CREATED_AT DESC LIMIT 1') {
          return mockQueryResults;
        }
        return { rows: [] };
      });

      // Act
      const result = await createCableAction(input);

      // Assert
      expect(executeQuery).toHaveBeenCalledWith('BEGIN TRANSACTION');
      expect(executeQuery).toHaveBeenCalledWith(
        'INSERT INTO CABLES (PRESET_ID, NAME, CATEGORY, DIAMETER) VALUES (?, ?, ?, ?)',
        [1, 'Test Cable', 'Power', 10],
      );
      expect(executeQuery).toHaveBeenCalledWith(
        'SELECT * FROM CABLES WHERE PRESET_ID = ? ORDER BY CREATED_AT DESC LIMIT 1',
        [1],
      );
      expect(executeQuery).toHaveBeenCalledWith('COMMIT');

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
        CATEGORY: null,
      };

      const mockQueryResults = {
        rows: [mockCableWithNullCategory],
      };

      // Set up mock implementation for executeQuery
      (executeQuery as any).mockImplementation((query: string) => {
        if (query === 'SELECT * FROM CABLES WHERE PRESET_ID = ? ORDER BY CREATED_AT DESC LIMIT 1') {
          return mockQueryResults;
        }
        return { rows: [] };
      });

      // Act
      const result = await createCableAction(input);

      // Assert
      expect(executeQuery).toHaveBeenCalledWith(
        'INSERT INTO CABLES (PRESET_ID, NAME, CATEGORY, DIAMETER) VALUES (?, ?, ?, ?)',
        [1, 'Test Cable', null, 10],
      );
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

      // Mock empty result set after insert
      (executeQuery as any).mockImplementation((query: string) => {
        if (query === 'SELECT * FROM CABLES WHERE PRESET_ID = ? ORDER BY CREATED_AT DESC LIMIT 1') {
          return { rows: [] };
        }
        return { rows: [] };
      });

      // Act
      const result = await createCableAction(input);

      // Assert
      expect(executeQuery).toHaveBeenCalledWith('ROLLBACK');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to retrieve the newly inserted cable');
    });

    it('handles database errors and rolls back transaction', async () => {
      // Arrange
      const input = {
        presetId: 1,
        name: 'Test Cable',
        diameter: 10,
      };

      const mockError = new Error('Database error');

      // Mock query execution error
      (executeQuery as any).mockImplementation((query: string) => {
        if (query === 'INSERT INTO CABLES (PRESET_ID, NAME, CATEGORY, DIAMETER) VALUES (?, ?, ?, ?)') {
          throw mockError;
        }
        return { rows: [] };
      });

      // Act
      const result = await createCableAction(input);

      // Assert
      expect(executeQuery).toHaveBeenCalledWith('ROLLBACK');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
      expect(console.error).toHaveBeenCalledWith('Error adding cable to preset:', mockError);
    });

    it('handles rollback errors', async () => {
      // Arrange
      const input = {
        presetId: 1,
        name: 'Test Cable',
        diameter: 10,
      };

      const mockError = new Error('Database error');
      const rollbackError = new Error('Rollback error');

      // Mock query execution error and rollback error
      (executeQuery as any).mockImplementation((query: string) => {
        if (query === 'INSERT INTO CABLES (PRESET_ID, NAME, CATEGORY, DIAMETER) VALUES (?, ?, ?, ?)') {
          throw mockError;
        }
        if (query === 'ROLLBACK') {
          throw rollbackError;
        }
        return { rows: [] };
      });

      // Act
      const result = await createCableAction(input);

      // Assert
      expect(console.error).toHaveBeenCalledWith('Error rolling back transaction:', rollbackError);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
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
        NAME: 'Updated Cable',
        CATEGORY: 'Updated Category',
        DIAMETER: 15,
      };

      // Mock successful update
      (executeQuery as any).mockImplementation((query: string) => {
        if (query.startsWith('UPDATE CABLES SET')) {
          return { rows: [{ 'number of rows updated': 1 }] };
        }
        if (query === 'SELECT * FROM CABLES WHERE ID = ?') {
          return { rows: [updatedCable] };
        }
        return { rows: [] };
      });

      // Act
      const result = await updateCableAction(cableId, updates);

      // Assert
      expect(executeQuery).toHaveBeenCalledWith('BEGIN TRANSACTION');

      // Check that the update query contains all fields
      const updateCall = (executeQuery as any).mock.calls.find(
        (call: string[]) => typeof call[0] === 'string' && call[0].startsWith('UPDATE CABLES SET'),
      );
      expect(updateCall[0]).toContain('NAME = ?');
      expect(updateCall[0]).toContain('CATEGORY = ?');
      expect(updateCall[0]).toContain('DIAMETER = ?');
      expect(updateCall[0]).toContain('UPDATED_AT = CURRENT_TIMESTAMP()');
      expect(updateCall[1]).toEqual(['Updated Cable', 'Updated Category', 15, 101]);

      expect(executeQuery).toHaveBeenCalledWith('SELECT * FROM CABLES WHERE ID = ?', [101]);
      expect(executeQuery).toHaveBeenCalledWith('COMMIT');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('updates a cable with partial fields', async () => {
      // Arrange
      const cableId = 101;
      const updates = {
        name: 'Updated Cable',
        // Only updating name
      };

      const updatedCable = {
        ...mockDBCable,
        NAME: 'Updated Cable',
      };

      // Mock successful update
      (executeQuery as any).mockImplementation((query: string) => {
        if (query.startsWith('UPDATE CABLES SET')) {
          return { rows: [{ 'number of rows updated': 1 }] };
        }
        if (query === 'SELECT * FROM CABLES WHERE ID = ?') {
          return { rows: [updatedCable] };
        }
        return { rows: [] };
      });

      // Act
      const result = await updateCableAction(cableId, updates);

      // Assert
      // Check that the update query contains only name field
      const updateCall = (executeQuery as any).mock.calls.find(
        (call: string[]) => typeof call[0] === 'string' && call[0].startsWith('UPDATE CABLES SET'),
      );
      expect(updateCall[0]).toContain('NAME = ?');
      expect(updateCall[0]).not.toContain('CATEGORY = ?');
      expect(updateCall[0]).not.toContain('DIAMETER = ?');
      expect(updateCall[1]).toEqual(['Updated Cable', 101]);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('returns error when no update fields provided', async () => {
      // Arrange
      const cableId = 101;
      const updates = {}; // Empty updates

      // Act
      const result = await updateCableAction(cableId, updates);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('No update fields provided');
      expect(executeQuery).not.toHaveBeenCalled();
    });

    it('handles cable not found during update', async () => {
      // Arrange
      const cableId = 999;
      const updates = { name: 'Updated Cable' };

      // Mock cable not found
      (executeQuery as any).mockImplementation((query: string) => {
        if (query.startsWith('UPDATE CABLES SET')) {
          return { rows: [{ 'number of rows updated': 0 }] };
        }
        return { rows: [] };
      });

      // Act
      const result = await updateCableAction(cableId, updates);

      // Assert
      expect(executeQuery).toHaveBeenCalledWith('ROLLBACK');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Cable with ID 999 not found');
    });

    it('handles failure to retrieve updated cable', async () => {
      // Arrange
      const cableId = 101;
      const updates = { name: 'Updated Cable' };

      // Mock update success but retrieval failure
      (executeQuery as any).mockImplementation((query: string) => {
        if (query.startsWith('UPDATE CABLES SET')) {
          return { rows: [{ 'number of rows updated': 1 }] };
        }
        if (query === 'SELECT * FROM CABLES WHERE ID = ?') {
          return { rows: [] }; // Empty result
        }
        return { rows: [] };
      });

      // Act
      const result = await updateCableAction(cableId, updates);

      // Assert
      expect(executeQuery).toHaveBeenCalledWith('ROLLBACK');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to retrieve the updated cable');
    });

    it('handles database errors during update', async () => {
      // Arrange
      const cableId = 101;
      const updates = { name: 'Updated Cable' };
      const mockError = new Error('Database error during update');

      // Mock database error
      (executeQuery as any).mockImplementation((query: string) => {
        if (query.startsWith('UPDATE CABLES SET')) {
          throw mockError;
        }
        return { rows: [] };
      });

      // Act
      const result = await updateCableAction(cableId, updates);

      // Assert
      expect(executeQuery).toHaveBeenCalledWith('ROLLBACK');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error during update');
      expect(console.error).toHaveBeenCalledWith(`Error updating cable ${cableId}:`, mockError);
    });
  });

  describe('deleteCableAction', () => {
    it('deletes a cable successfully', async () => {
      // Arrange
      const cableId = 101;

      // Mock cable exists
      (executeQuery as any).mockImplementation((query: string) => {
        if (query === 'SELECT ID FROM CABLES WHERE ID = ?') {
          return { rows: [{ ID: cableId }] };
        }
        return { rows: [] };
      });

      // Act
      const result = await deleteCableAction(cableId);

      // Assert
      expect(executeQuery).toHaveBeenCalledWith('SELECT ID FROM CABLES WHERE ID = ?', [cableId]);
      expect(executeQuery).toHaveBeenCalledWith('DELETE FROM CABLES WHERE ID = ?', [cableId]);
      expect(result.success).toBe(true);
    });

    it('returns error when cable not found', async () => {
      // Arrange
      const cableId = 999;

      // Mock cable not found
      (executeQuery as any).mockImplementation(() => ({ rows: [] }));

      // Act
      const result = await deleteCableAction(cableId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Cable with ID 999 not found');
      expect(executeQuery).not.toHaveBeenCalledWith('DELETE FROM CABLES WHERE ID = ?', [cableId]);
    });

    it('handles database errors during deletion', async () => {
      // Arrange
      const cableId = 101;
      const mockError = new Error('Database error during deletion');

      // Mock cable exists but delete fails
      (executeQuery as any).mockImplementation((query: string) => {
        if (query === 'SELECT ID FROM CABLES WHERE ID = ?') {
          return { rows: [{ ID: cableId }] };
        }
        if (query === 'DELETE FROM CABLES WHERE ID = ?') {
          throw mockError;
        }
        return { rows: [] };
      });

      // Act
      const result = await deleteCableAction(cableId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error during deletion');
      expect(console.error).toHaveBeenCalledWith(`Error deleting cable ${cableId}:`, mockError);
    });
  });
});
