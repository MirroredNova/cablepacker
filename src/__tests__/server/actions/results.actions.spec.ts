import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { saveResultAction, getResultByIdAction } from '@/server/actions/results.actions';
import { getSupabaseClient } from '@/server/db/supabase.db';
import { mapDBResultToSavedResult } from '@/server/utils/mappers.utils';
import { CreateResult } from '@/types/domain.types';
import { DBResult } from '@/types/database.types';

// Mock dependencies
vi.mock('@/server/db/supabase.db', () => ({
  getSupabaseClient: vi.fn(),
}));

vi.mock('@/server/utils/mappers.utils', () => ({
  mapDBResultToSavedResult: vi.fn(),
}));

describe('Results Actions', () => {
  // Mock data for testing
  const mockCreateResult: CreateResult = {
    id: 'test-result-123',
    inputCables: [
      {
        id: 'cable-1',
        selectedCable: 'custom',
        customName: 'Test Cable',
        customDiameter: 0.5,
        quantity: 3,
      },
    ],
    resultData: {
      bore: {
        name: 'bore',
        radius: 1.25,
        diameter: 2.5,
        coordinates: { x: 0, y: 0 },
        color: 'black',
      },
      cables: [
        {
          radius: 0.25,
          name: 'Test Cable',
          coordinates: { x: 0, y: 0 },
          color: '#ff0000',
          diameter: 0,
        },
      ],
    },
    selectedPresetId: 123,
    cableCount: 3,
    boreDiameter: 2.5,
    createdAt: new Date('2023-01-01'),
  };

  const mockDBResult: DBResult = {
    id: 'test-result-123',
    input_cables: mockCreateResult.inputCables,
    result_data: mockCreateResult.resultData,
    selected_preset_id: 123,
    cable_count: 3,
    bore_diameter: 2.5,
    created_at: '2023-01-01T00:00:00.000Z',
  };

  let mockSupabaseClient: any;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Create mock Supabase client with chainable methods
    mockSupabaseClient = {
      from: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    };

    (getSupabaseClient as any).mockResolvedValue(mockSupabaseClient);

    // Setup default mock implementations
    (mapDBResultToSavedResult as any).mockReturnValue({
      ...mockCreateResult,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('saveResultAction', () => {
    it('successfully saves a result to the database', async () => {
      // Arrange
      mockSupabaseClient.single.mockResolvedValue({
        data: mockDBResult,
        error: null,
      });

      // Act
      const result = await saveResultAction(mockCreateResult);

      // Assert
      // Verify the Supabase client was called correctly
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('results');
      expect(mockSupabaseClient.insert).toHaveBeenCalledWith({
        id: mockCreateResult.id,
        input_cables: mockCreateResult.inputCables,
        result_data: mockCreateResult.resultData,
        selected_preset_id: mockCreateResult.selectedPresetId,
        cable_count: mockCreateResult.cableCount,
        bore_diameter: mockCreateResult.boreDiameter,
        created_at: mockCreateResult.createdAt,
      });
      expect(mockSupabaseClient.select).toHaveBeenCalled();
      expect(mockSupabaseClient.single).toHaveBeenCalled();

      // Verify the result
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('handles database errors when saving', async () => {
      // Arrange
      const dbError = { message: 'Database connection error', code: 'DB_ERROR' };
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: dbError,
      });

      // Spy on console.error to verify it's called
      const consoleErrorSpy = vi.spyOn(console, 'error');

      // Act
      const result = await saveResultAction(mockCreateResult);

      // Assert
      // Verify error message is logged
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error saving result:', dbError);

      // Verify error response
      expect(result).toEqual({
        success: false,
        error: 'Database connection error',
      });

      // Restore console.error
      consoleErrorSpy.mockRestore();
    });

    it('handles null data response', async () => {
      // Arrange
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: null,
      });

      // Act
      const result = await saveResultAction(mockCreateResult);

      // Assert
      expect(result).toEqual({
        success: false,
        error: 'Failed to save result',
      });
    });

    it('handles results with null selectedPresetId', async () => {
      // Arrange
      const resultWithoutPreset = { ...mockCreateResult, selectedPresetId: null };

      mockSupabaseClient.single.mockResolvedValue({
        data: { ...mockDBResult, selected_preset_id: null },
        error: null,
      });

      // Act
      await saveResultAction(resultWithoutPreset);

      // Assert
      // Verify the insert was called with null for selected_preset_id
      expect(mockSupabaseClient.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          selected_preset_id: null,
        }),
      );
    });
  });

  describe('getResultByIdAction', () => {
    it('successfully retrieves a result by ID', async () => {
      // Arrange
      mockSupabaseClient.single.mockResolvedValue({
        data: mockDBResult,
        error: null,
      });

      // Act
      const result = await getResultByIdAction('test-result-123');

      // Assert
      // Verify the query was called correctly
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('results');
      expect(mockSupabaseClient.select).toHaveBeenCalledWith('*');
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'test-result-123');
      expect(mockSupabaseClient.single).toHaveBeenCalled();

      // Verify the mapper was called
      expect(mapDBResultToSavedResult).toHaveBeenCalledWith(mockDBResult);

      // Verify the result
      expect(result).toEqual({
        success: true,
        data: expect.anything(), // Whatever mapDBResultToSavedResult returns
      });
    });

    it('handles non-existent result IDs', async () => {
      // Arrange
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' },
      });

      // Act
      const result = await getResultByIdAction('non-existent-id');

      // Assert
      expect(result).toEqual({
        success: false,
        error: 'No result found with ID: non-existent-id',
      });

      // Verify mapper was not called
      expect(mapDBResultToSavedResult).not.toHaveBeenCalled();
    });

    it('handles database errors when retrieving', async () => {
      // Arrange
      const dbError = { message: 'Query execution failed', code: 'DB_ERROR' };
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: dbError,
      });

      // Spy on console.error
      const consoleErrorSpy = vi.spyOn(console, 'error');

      // Act
      const result = await getResultByIdAction('test-result-123');

      // Assert
      // Verify error message is logged
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching result:', dbError);

      // Verify error response
      expect(result).toEqual({
        success: false,
        error: 'Query execution failed',
      });

      // Restore console.error
      consoleErrorSpy.mockRestore();
    });

    it('handles null data response', async () => {
      // Arrange
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: null,
      });

      // Act
      const result = await getResultByIdAction('test-result-123');

      // Assert
      expect(result).toEqual({
        success: false,
        error: 'No result found with ID: test-result-123',
      });
    });

    it('correctly processes database result through the mapper', async () => {
      // Arrange
      const mappedResult = {
        id: 'test-result-123',
        inputCables: [
          {
            /* mapped data */
          },
        ],
        resultData: {
          /* mapped data */
        },
        selectedPresetId: 123,
        cableCount: 3,
        boreDiameter: 2.5,
        createdAt: new Date('2023-01-01'),
      };

      mockSupabaseClient.single.mockResolvedValue({
        data: mockDBResult,
        error: null,
      });

      (mapDBResultToSavedResult as any).mockReturnValue(mappedResult);

      // Act
      const result = await getResultByIdAction('test-result-123');

      // Assert
      expect(mapDBResultToSavedResult).toHaveBeenCalledWith(mockDBResult);
      expect(result).toEqual({
        success: true,
        data: mappedResult,
      });
    });
  });

  describe('Integration between actions', () => {
    it('data saved by saveResultAction can be retrieved by getResultByIdAction', async () => {
      // Arrange - Configure mocks to simulate a save followed by a retrieval
      // For the save operation
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: mockDBResult,
        error: null,
      });

      // For the retrieve operation
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: mockDBResult,
        error: null,
      });

      (mapDBResultToSavedResult as any).mockReturnValue(mockCreateResult);

      // Act - First save, then retrieve
      await saveResultAction(mockCreateResult);
      const retrieveResult = await getResultByIdAction(mockCreateResult.id);

      // Assert
      expect(retrieveResult).toEqual({
        success: true,
        data: mockCreateResult,
      });

      // Verify both operations were called correctly
      expect(mockSupabaseClient.from).toHaveBeenNthCalledWith(1, 'results');
      expect(mockSupabaseClient.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockCreateResult.id,
        }),
      );

      expect(mockSupabaseClient.from).toHaveBeenNthCalledWith(2, 'results');
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', mockCreateResult.id);
    });
  });
});
