import React, { useContext } from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ResultProvider } from '@/components/providers/ResultProvider';
import { ResultContext } from '@/context/ResultContext';
import { getResultByIdAction } from '@/server/actions/results.actions';
import { Result } from '@/types/domain.types';
import usePreset from '@/hooks/usePreset';
import useTable from '@/hooks/useTable';
import { BoreResult } from '@/types/algorithm.types';
import { TableRowData } from '@/types/table.types';

// Mock Next.js navigation hooks
vi.mock('next/navigation', () => ({
  useParams: vi.fn(() => ({ resultId: 'test-result-123' })),
  usePathname: vi.fn(() => '/test-result-123'),
}));

// Mock hooks
vi.mock('@/hooks/usePreset', () => ({
  default: vi.fn(),
}));

vi.mock('@/hooks/useTable', () => ({
  default: vi.fn(),
}));

// Mock server actions
vi.mock('@/server/actions/results.actions', () => ({
  getResultByIdAction: vi.fn(),
}));

// Mock window.history
const mockReplaceState = vi.fn();
Object.defineProperty(window, 'history', {
  writable: true,
  value: {
    replaceState: mockReplaceState,
  },
});

// Sample data for testing
const mockTableRows: TableRowData[] = [
  {
    id: 'cable-1',
    selectedCable: 'custom',
    customName: 'Cable 1',
    customDiameter: 5,
    quantity: 2,
  },
  {
    id: 'cable-2',
    selectedCable: 'custom',
    customName: 'Cable 2',
    customDiameter: 3,
    quantity: 3,
  },
];

const mockBoreResult: BoreResult = {
  bore: {
    radius: 10,
    diameter: 20,
    name: '',
    coordinates: {
      x: 0,
      y: 0,
    },
  },
  cables: [
    {
      name: 'Cable 1',
      diameter: 5,
      radius: 2.5,
      coordinates: { x: 0, y: 0 },
      color: '#ff0000',
    },
    {
      name: 'Cable 2',
      diameter: 3,
      radius: 1.5,
      coordinates: { x: 4, y: 0 },
      color: '#00ff00',
    },
  ],
};

const mockResult: Result = {
  id: 'test-result-123',
  inputCables: mockTableRows,
  resultData: mockBoreResult,
  selectedPresetId: 1,
  cableCount: 5,
  boreDiameter: 20,
  createdAt: new Date('2023-01-01'),
};

// Test component that consumes the ResultContext
function TestComponent() {
  const context = useContext(ResultContext);

  if (!context) {
    throw new Error('ResultContext must be used within a ResultProvider');
  }

  const { result, loading, error, resultId, setResult, setLoading, setError, fetchResult, resetResult } = context;

  return (
    <div>
      <div data-testid="result-data">
        {result
          ? JSON.stringify({
            ...result,
            createdAt: result.createdAt.toISOString(),
          })
          : 'null'}
      </div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="error">{error || 'null'}</div>
      <div data-testid="result-id">{resultId || 'null'}</div>

      <button type="button" data-testid="set-result" onClick={() => setResult(mockResult)}>
        Set Result
      </button>

      <button type="button" data-testid="set-result-navigate" onClick={() => setResult(mockResult, true)}>
        Set Result with Navigation
      </button>

      <button type="button" data-testid="reset-result" onClick={() => resetResult()}>
        Reset Result
      </button>

      <button type="button" data-testid="fetch-result" onClick={() => fetchResult('test-result-123')}>
        Fetch Result
      </button>

      <button type="button" data-testid="set-loading" onClick={() => setLoading(true)}>
        Set Loading
      </button>

      <button type="button" data-testid="set-error" onClick={() => setError('Test error')}>
        Set Error
      </button>
    </div>
  );
}

describe('ResultProvider', () => {
  // Setup mocks
  const mockSetSelectedPreset = vi.fn();
  const mockResetPresets = vi.fn();
  const mockSetTableData = vi.fn();
  const mockResetTableData = vi.fn();
  const mockSetHasChangedSinceGeneration = vi.fn();

  // Setup console mocks to prevent test noise
  const originalConsoleError = console.error;

  beforeEach(() => {
    console.error = vi.fn();
    vi.clearAllMocks();

    // Setup hook mocks
    (usePreset as any).mockReturnValue({
      presets: [
        { id: 1, name: 'Preset 1', cables: [] },
        { id: 2, name: 'Preset 2', cables: [] },
      ],
      setSelectedPreset: mockSetSelectedPreset,
      resetPresets: mockResetPresets,
      presetsLoaded: true,
    });

    (useTable as any).mockReturnValue({
      setTableData: mockSetTableData,
      resetTableData: mockResetTableData,
      setHasChangedSinceGeneration: mockSetHasChangedSinceGeneration,
    });

    // Default mock implementation for success case
    (getResultByIdAction as any).mockResolvedValue({
      success: true,
      data: mockResult,
    });
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it('renders children without crashing', () => {
    render(
      <ResultProvider>
        <div data-testid="child-element">Child Content</div>
      </ResultProvider>,
    );

    expect(screen.getByTestId('child-element')).toBeInTheDocument();
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('fetches result on mount when resultId is in URL', async () => {
    render(
      <ResultProvider>
        <TestComponent />
      </ResultProvider>,
    );

    await waitFor(() => {
      expect(getResultByIdAction).toHaveBeenCalledWith('test-result-123');
      expect(screen.getByTestId('result-data')).not.toHaveTextContent('null');
      expect(mockSetTableData).toHaveBeenCalledWith(mockResult.inputCables);
      expect(mockSetSelectedPreset).toHaveBeenCalled();
      expect(mockSetHasChangedSinceGeneration).toHaveBeenCalledWith(false);
    });
  });

  it('handles loading states correctly during fetch', async () => {
    // Mock a delay in the API response
    (getResultByIdAction as any).mockImplementation(
      () => new Promise((resolve) => {
        setTimeout(() => {
          resolve({ success: true, data: mockResult });
        }, 100);
      }),
    );

    render(
      <ResultProvider>
        <TestComponent />
      </ResultProvider>,
    );

    // Initial state should show loading
    expect(screen.getByTestId('loading')).toHaveTextContent('true');

    // After API response, loading should be false
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
      expect(screen.getByTestId('result-data')).toHaveTextContent(mockResult.id);
    });
  });

  it('handles error when fetching result', async () => {
    // Mock error response
    (getResultByIdAction as any).mockResolvedValue({
      success: false,
      error: 'Result not found',
    });

    render(
      <ResultProvider>
        <TestComponent />
      </ResultProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Result not found');
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
  });

  it('handles exceptions when fetching result', async () => {
    // Mock exception
    (getResultByIdAction as any).mockRejectedValue(new Error('Network error'));

    render(
      <ResultProvider>
        <TestComponent />
      </ResultProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Network error');
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
  });

  it('does not fetch again if result is already loaded', async () => {
    // Setup mocked implementation to track calls
    const mockFetch = vi.fn().mockResolvedValue({
      success: true,
      data: mockResult,
    });
    (getResultByIdAction as any).mockImplementation(mockFetch);

    render(
      <ResultProvider>
        <TestComponent />
      </ResultProvider>,
    );

    // Wait for first call to complete
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId('result-data')).toHaveTextContent(mockResult.id);
    });

    // Trigger a re-render
    await act(async () => {
      screen.getByTestId('set-loading').click();
    });

    // Verify no additional fetch was made
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('sets result manually without fetching', async () => {
    render(
      <ResultProvider>
        <TestComponent />
      </ResultProvider>,
    );

    // Clear any effects from initial mount
    vi.clearAllMocks();

    // Set result manually
    await act(async () => {
      screen.getByTestId('set-result').click();
    });

    // Verify result was set and dependencies were called
    expect(screen.getByTestId('result-data')).toHaveTextContent(mockResult.id);
    expect(mockSetTableData).toHaveBeenCalledWith(mockResult.inputCables);
    expect(mockSetSelectedPreset).toHaveBeenCalled();

    // Verify we didn't fetch from API
    expect(getResultByIdAction).not.toHaveBeenCalled();
  });

  it('sets result with navigation', async () => {
    render(
      <ResultProvider>
        <TestComponent />
      </ResultProvider>,
    );

    // Clear any effects from initial mount
    vi.clearAllMocks();

    // Set result with navigation
    await act(async () => {
      screen.getByTestId('set-result-navigate').click();
    });

    // Verify navigation was called
    expect(mockReplaceState).toHaveBeenCalledWith({ resultId: 'test-result-123' }, '', '/test-result-123');
  });

  it('handles delayed preset loading', async () => {
    // Mock presets as not loaded yet
    (usePreset as any).mockReturnValue({
      presets: [],
      setSelectedPreset: mockSetSelectedPreset,
      resetPresets: mockResetPresets,
      presetsLoaded: false,
    });

    render(
      <ResultProvider>
        <TestComponent />
      </ResultProvider>,
    );

    // Initial result load - should store preset in pendingPresetIdRef
    await waitFor(() => {
      expect(screen.getByTestId('result-data')).not.toHaveTextContent('null');
      // Selected preset should not be called yet
      expect(mockSetSelectedPreset).not.toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
    });

    // Now update the preset hook to indicate presets are loaded
    (usePreset as any).mockReturnValue({
      presets: [
        { id: 1, name: 'Preset 1', cables: [] },
        { id: 2, name: 'Preset 2', cables: [] },
      ],
      setSelectedPreset: mockSetSelectedPreset,
      resetPresets: mockResetPresets,
      presetsLoaded: true,
    });

    // Force a re-render to trigger the effect
    await act(async () => {
      screen.getByTestId('set-loading').click();
    });

    // Now the selected preset should be set
    expect(mockSetSelectedPreset).toHaveBeenCalled();
  });

  it('provides context with the expected shape', () => {
    let contextValue: any;

    function ContextInspector() {
      contextValue = useContext(ResultContext);
      return null;
    }

    render(
      <ResultProvider>
        <ContextInspector />
      </ResultProvider>,
    );

    // Check all context properties
    expect(contextValue).toHaveProperty('result');
    expect(contextValue).toHaveProperty('loading');
    expect(contextValue).toHaveProperty('error');
    expect(contextValue).toHaveProperty('resultId');
    expect(contextValue).toHaveProperty('setResult');
    expect(contextValue).toHaveProperty('setLoading');
    expect(contextValue).toHaveProperty('setError');
    expect(contextValue).toHaveProperty('fetchResult');
    expect(contextValue).toHaveProperty('resetResult');

    // Check types
    expect(typeof contextValue.setResult).toBe('function');
    expect(typeof contextValue.fetchResult).toBe('function');
    expect(typeof contextValue.resetResult).toBe('function');
    expect(typeof contextValue.loading).toBe('boolean');
  });
});
