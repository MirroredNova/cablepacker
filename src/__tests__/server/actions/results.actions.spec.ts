import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { saveResultAction, getResultByIdAction } from '@/server/actions/results.actions';
import { executeQuery } from '@/server/db/snowflake.db';
import { mapDBResultToSavedResult } from '@/server/utils/mappers.utils';
import { CreateResult } from '@/types/domain.types';
import { DBResult } from '@/types/database.types';

// Mock dependencies
vi.mock('@/server/db/snowflake.db', () => ({
  executeQuery: vi.fn(),
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
    ID: 'test-result-123',
    INPUT_CABLES: mockCreateResult.inputCables,
    RESULT_DATA: mockCreateResult.resultData,
    SELECTED_PRESET_ID: 123,
    CABLE_COUNT: 3,
    BORE_DIAMETER: 2.5,
    CREATED_AT: '2023-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Setup default mock implementations
    (executeQuery as any).mockResolvedValue({ rows: [mockDBResult] });
    (mapDBResultToSavedResult as any).mockReturnValue({
      ...mockCreateResult,
      // Add any fields that would be added by the mapper
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('saveResultAction', () => {
    it('successfully saves a result to the database', async () => {
      // Arrange
      (executeQuery as any).mockResolvedValue({ rowCount: 1 });

      // Act
      const result = await saveResultAction(mockCreateResult);

      // Assert
      // Verify the query was called correctly
      expect(executeQuery).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO RESULTS'), [
        mockCreateResult.id,
        JSON.stringify(mockCreateResult.inputCables),
        JSON.stringify(mockCreateResult.resultData),
        mockCreateResult.selectedPresetId,
        mockCreateResult.cableCount,
        mockCreateResult.boreDiameter,
        mockCreateResult.createdAt,
      ]);

      // Verify the result
      expect(result).toEqual({
        success: true,
        data: mockCreateResult,
      });
    });

    it('handles database errors when saving', async () => {
      // Arrange
      const dbError = new Error('Database connection error');
      (executeQuery as any).mockRejectedValue(dbError);

      // Spy on console.error to verify it's called
      const consoleErrorSpy = vi.spyOn(console, 'error');

      // Act
      const result = await saveResultAction(mockCreateResult);

      // Assert
      // Verify error message is logged
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error saving calculation result:', dbError);

      // Verify error response
      expect(result).toEqual({
        success: false,
        error: 'Database connection error',
      });

      // Restore console.error
      consoleErrorSpy.mockRestore();
    });

    it('handles JSON stringification correctly', async () => {
      // Arrange
      const resultWithCircularRef: any = { ...mockCreateResult };

      // Mock JSON.stringify to throw an error
      const originalStringify = JSON.stringify;
      JSON.stringify = vi.fn().mockImplementation(() => {
        throw new TypeError('Converting circular structure to JSON');
      });

      try {
        // Act
        const result = await saveResultAction(resultWithCircularRef);

        // Assert
        expect(result).toEqual({
          success: false,
          error: expect.stringContaining('circular'),
        });

        // Verify JSON.stringify was called
        expect(JSON.stringify).toHaveBeenCalled();
      } finally {
        // Restore original JSON.stringify
        JSON.stringify = originalStringify;
      }
    });

    it('handles results with null selectedPresetId', async () => {
      // Arrange
      const resultWithoutPreset = { ...mockCreateResult, selectedPresetId: null };

      // Act
      await saveResultAction(resultWithoutPreset);

      // Assert
      // Verify the query was called with null for selectedPresetId
      expect(executeQuery).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([null]), // The 4th parameter should be null
      );
    });
  });

  describe('getResultByIdAction', () => {
    it('successfully retrieves a result by ID', async () => {
      // Arrange - using default mocks

      // Act
      const result = await getResultByIdAction('test-result-123');

      // Assert
      // Verify the query was called correctly
      expect(executeQuery).toHaveBeenCalledWith('SELECT * FROM RESULTS WHERE ID = ?', ['test-result-123']);

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
      (executeQuery as any).mockResolvedValue({ rows: [] });

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
      const dbError = new Error('Query execution failed');
      (executeQuery as any).mockRejectedValue(dbError);

      // Spy on console.error
      const consoleErrorSpy = vi.spyOn(console, 'error');

      // Act
      const result = await getResultByIdAction('test-result-123');

      // Assert
      // Verify error message is logged
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error retrieving result test-result-123:', dbError);

      // Verify error response
      expect(result).toEqual({
        success: false,
        error: 'Query execution failed',
      });

      // Restore console.error
      consoleErrorSpy.mockRestore();
    });

    it('handles invalid result IDs', async () => {
      // Test with invalid inputs
      const testCases = [
        { id: '', expectedError: 'No result found with ID: ' },
        { id: null as any, expectedError: expect.stringContaining('null') },
      ];

      // Mock empty results for invalid IDs
      (executeQuery as any).mockResolvedValue({ rows: [] });

      // Act
      await Promise.all(
        testCases.map(async (testCase) => {
          const result = await getResultByIdAction(testCase.id);

          // Assert
          expect(result.success).toBe(false);
          if (testCase.id === null) {
            // For null, it might throw a different error during query execution
            expect(result.error).toBeTruthy();
          } else {
            expect(result.error).toEqual(testCase.expectedError);
          }
        }),
      );
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
      (executeQuery as any).mockResolvedValueOnce({ rowCount: 1 });

      // For the retrieve operation
      (executeQuery as any).mockResolvedValueOnce({ rows: [mockDBResult] });
      (mapDBResultToSavedResult as any).mockReturnValue(mockCreateResult);

      // Act - First save, then retrieve
      await saveResultAction(mockCreateResult);
      const retrieveResult = await getResultByIdAction(mockCreateResult.id);

      // Assert
      expect(retrieveResult).toEqual({
        success: true,
        data: mockCreateResult,
      });

      // Verify both queries were called correctly
      expect(executeQuery).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining('INSERT INTO RESULTS'),
        expect.arrayContaining([mockCreateResult.id]),
      );

      expect(executeQuery).toHaveBeenNthCalledWith(2, 'SELECT * FROM RESULTS WHERE ID = ?', [mockCreateResult.id]);
    });
  });
});
