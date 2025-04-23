import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateBoreAction } from '@/server/actions/bore.actions';
import { saveResultAction } from '@/server/actions/results.actions';
import { calculateMinimumEncloseForCircles } from '@/server/utils/algo.utils';
import { assignColorsToCircles, mapCablesToCircles } from '@/server/utils/circles.utils';
import { generateResultId } from '@/server/utils/result.utils';
import { TableRowData } from '@/types/table.types';

// Mock dependencies
vi.mock('@/server/actions/results.actions', () => ({
  saveResultAction: vi.fn(),
}));

vi.mock('@/server/utils/algo.utils', () => ({
  calculateMinimumEncloseForCircles: vi.fn(),
}));

vi.mock('@/server/utils/circles.utils', () => ({
  mapCablesToCircles: vi.fn(),
  assignColorsToCircles: vi.fn(),
}));

vi.mock('@/server/utils/result.utils', () => ({
  generateResultId: vi.fn(),
}));

vi.mock('@/config', () => ({
  serverConfig: {
    MAX_CIRCLES: 50,
  },
}));

describe('generateBoreAction', () => {
  // Sample table data for testing
  const mockTableData: TableRowData[] = [
    {
      id: 'row-1',
      selectedCable: 'custom',
      customName: 'Cable 1',
      customDiameter: 0.5,
      quantity: 3,
    },
    {
      id: 'row-2',
      selectedCable: { id: 1, name: 'Preset Cable', diameter: 0.75 } as any,
      quantity: 2,
    },
  ];

  // Mock circles for testing
  const mockCircles = [
    { id: 'circle-1', radius: 0.25, name: 'Cable 1', coordinates: { x: 0, y: 0 } },
    { id: 'circle-2', radius: 0.25, name: 'Cable 1', coordinates: { x: 0.5, y: 0 } },
    { id: 'circle-3', radius: 0.25, name: 'Cable 1', coordinates: { x: 1, y: 0 } },
    { id: 'circle-4', radius: 0.375, name: 'Preset Cable', coordinates: { x: 0, y: 0.5 } },
    { id: 'circle-5', radius: 0.375, name: 'Preset Cable', coordinates: { x: 0.75, y: 0.5 } },
  ];

  // Mock colored circles
  const mockColoredCircles = mockCircles.map((circle, index) => ({
    ...circle,
    color: `#${index}00000`,
  }));

  // Mock enclosing circle
  const mockEnclose = {
    name: 'bore',
    radius: 2.5,
    diameter: 5.0,
    coordinates: { x: 0, y: 0 },
    color: 'black',
  };

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Setup default mock implementations
    (mapCablesToCircles as any).mockReturnValue(mockCircles);
    (calculateMinimumEncloseForCircles as any).mockReturnValue({
      enclose: mockEnclose,
      circles: mockCircles,
    });
    (assignColorsToCircles as any).mockReturnValue(mockColoredCircles);
    (generateResultId as any).mockReturnValue('test-result-id');
    (saveResultAction as any).mockResolvedValue({ success: true });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('successfully generates a bore with valid inputs', async () => {
    // Call the action
    const result = await generateBoreAction(mockTableData, 123);

    // Verify that mapCablesToCircles was called with the table data
    expect(mapCablesToCircles).toHaveBeenCalledWith(mockTableData);

    // Verify that calculateMinimumEncloseForCircles was called with the circles
    expect(calculateMinimumEncloseForCircles).toHaveBeenCalledWith(mockCircles);

    // Verify that assignColorsToCircles was called with the arranged circles
    expect(assignColorsToCircles).toHaveBeenCalledWith(mockCircles);

    // Verify that generateResultId was called to create a unique ID
    expect(generateResultId).toHaveBeenCalled();

    // Verify that saveResultAction was called with the correct data
    expect(saveResultAction).toHaveBeenCalled();
    const savedResult = (saveResultAction as any).mock.calls[0][0];
    expect(savedResult).toMatchObject({
      id: 'test-result-id',
      inputCables: mockTableData,
      resultData: {
        bore: mockEnclose,
        cables: mockColoredCircles,
      },
      selectedPresetId: 123,
      cableCount: mockCircles.length,
      boreDiameter: mockEnclose.diameter,
    });

    // Verify successful response
    expect(result).toEqual({
      success: true,
      data: expect.objectContaining({
        id: 'test-result-id',
        boreDiameter: 5.0,
      }),
    });
  });

  it('handles empty cables input', async () => {
    // Call with empty cable array
    const result = await generateBoreAction([], null);

    // Verify error response
    expect(result).toEqual({
      success: false,
      error: 'No cables entered.',
    });

    // Verify that calculations were not performed
    expect(mapCablesToCircles).not.toHaveBeenCalled();
    expect(calculateMinimumEncloseForCircles).not.toHaveBeenCalled();
    expect(saveResultAction).not.toHaveBeenCalled();
  });

  it('handles null cables input', async () => {
    // Call with null cables
    const result = await generateBoreAction(null as any, null);

    // Verify error response
    expect(result).toEqual({
      success: false,
      error: 'No cables entered.',
    });
  });

  it('handles exceeding maximum number of cables', async () => {
    // Mock mapCablesToCircles to return more than MAX_CIRCLES
    const manyCircles = Array(51).fill(mockCircles[0]);
    (mapCablesToCircles as any).mockReturnValue(manyCircles);

    // Call the action
    const result = await generateBoreAction(mockTableData, null);

    // Verify error response
    expect(result).toEqual({
      success: false,
      error: 'Exceeded maximum number of cables (50).',
    });
  });

  it('handles errors from calculateMinimumEncloseForCircles', async () => {
    // Mock calculation function to throw error
    (calculateMinimumEncloseForCircles as any).mockImplementation(() => {
      throw new Error('Failed to calculate enclosure');
    });

    // Call the action
    const result = await generateBoreAction(mockTableData, null);

    // Verify error response
    expect(result).toEqual({
      success: false,
      error: 'Failed to calculate enclosure',
    });
  });

  it('handles error from saveResultAction', async () => {
    // Mock save to fail
    (saveResultAction as any).mockResolvedValue({
      success: false,
      error: 'Database error',
    });

    // Call the action
    const result = await generateBoreAction(mockTableData, null);

    // Verify error response
    expect(result).toEqual({
      success: false,
      error: 'Failed to save the result.',
    });
  });

  it('passes the correct presetId to the result', async () => {
    // Call with a different preset ID
    await generateBoreAction(mockTableData, 456);

    // Verify preset ID was passed to the result
    const savedResult = (saveResultAction as any).mock.calls[0][0];
    expect(savedResult.selectedPresetId).toBe(456);
  });

  it('correctly handles null presetId', async () => {
    // Call with null preset ID
    await generateBoreAction(mockTableData, null);

    // Verify preset ID was null in the result
    const savedResult = (saveResultAction as any).mock.calls[0][0];
    expect(savedResult.selectedPresetId).toBeNull();
  });

  it('preserves the original table data in the result', async () => {
    // Call the action
    await generateBoreAction(mockTableData, null);

    // Verify input cables were preserved
    const savedResult = (saveResultAction as any).mock.calls[0][0];
    expect(savedResult.inputCables).toBe(mockTableData);
  });

  it('includes the correct timestamp in the result', async () => {
    // Mock Date to have a consistent value for testing
    const mockDate = new Date('2023-01-01T00:00:00Z');
    const originalDate = global.Date;
    global.Date = class extends Date {
      constructor() {
        super(mockDate.toISOString());
      }
    } as any;

    // Call the action
    await generateBoreAction(mockTableData, null);

    // Verify the timestamp
    const savedResult = (saveResultAction as any).mock.calls[0][0];
    expect(savedResult.createdAt).toEqual(mockDate);

    // Restore original Date
    global.Date = originalDate;
  });
});
