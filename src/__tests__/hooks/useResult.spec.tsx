import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import useResult from '@/hooks/useResult';
import { ResultContext, ResultContextType } from '@/context/ResultContext';
import { Result } from '@/types/domain.types';

describe('useResult', () => {
  // Create a mock result
  const mockResult: Result = {
    id: 'result-123',
    boreDiameter: 4.75,
    createdAt: new Date('2023-01-01'),
    resultData: {
      cables: [],
      bore: {
        name: 'test-bore',
        diameter: 4.75,
        radius: 2.375,
        coordinates: { x: 0, y: 0 },
        color: 'black',
      },
    },
    inputCables: [],
    selectedPresetId: 123,
    cableCount: 0,
  };

  // Setup mock context functions
  const mockSetResult = vi.fn();
  const mockSetLoading = vi.fn();
  const mockSetError = vi.fn();
  const mockFetchResult = vi.fn().mockResolvedValue(true);
  const mockResetResult = vi.fn();

  // Mock result context value
  let mockResultValue: ResultContextType;

  beforeEach(() => {
    // Reset all mock functions
    vi.clearAllMocks();

    // Create a fresh context value for each test
    mockResultValue = {
      result: mockResult,
      loading: false,
      error: null,
      resultId: 'result-123',
      setResult: mockSetResult,
      setLoading: mockSetLoading,
      setError: mockSetError,
      fetchResult: mockFetchResult,
      resetResult: mockResetResult,
    };
  });

  it('returns the context value when used within ResultContext provider', () => {
    // Wrapper component that provides the result context
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ResultContext.Provider value={mockResultValue}>{children}</ResultContext.Provider>
    );

    // Render the hook within the context provider
    const { result } = renderHook(() => useResult(), { wrapper });

    // Verify that the hook returns the provided context value
    expect(result.current).toEqual(mockResultValue);
    expect(result.current.result).toBe(mockResult);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.resultId).toBe('result-123');

    // Verify that all functions are available
    expect(result.current.setResult).toBe(mockSetResult);
    expect(result.current.setLoading).toBe(mockSetLoading);
    expect(result.current.setError).toBe(mockSetError);
    expect(result.current.fetchResult).toBe(mockFetchResult);
    expect(result.current.resetResult).toBe(mockResetResult);
  });

  it('throws an error when used outside of ResultContext provider', () => {
    // Use console.error spy to suppress the expected error in test output
    const consoleErrorSpy = vi.spyOn(console, 'error');
    consoleErrorSpy.mockImplementation(() => {});

    // Attempt to render the hook without a context provider
    expect(() => {
      renderHook(() => useResult());
    }).toThrow('useResult must be used within a ResultProvider');

    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  it('correctly handles state changes', () => {
    // Create a wrapper with stateful context
    function TestWrapper({ children }: { children: React.ReactNode }) {
      const [result, setResultState] = React.useState<Result | null>(mockResult);
      const [loading, setLoadingState] = React.useState(false);
      const [error, setErrorState] = React.useState<string | null>(null);
      const [resultId, setResultId] = React.useState<string | null>('result-123');

      const contextValue: ResultContextType = React.useMemo(
        () => ({
          result,
          loading,
          error,
          resultId,
          setResult: (newResult: Result | null, navigate?: boolean) => {
            setResultState(newResult);
            setResultId(newResult?.id || null);
            mockSetResult(newResult, navigate);
          },
          setLoading: (newLoading: boolean) => {
            setLoadingState(newLoading);
            mockSetLoading(newLoading);
          },
          setError: (newError: string | null) => {
            setErrorState(newError);
            mockSetError(newError);
          },
          fetchResult: mockFetchResult,
          resetResult: () => {
            setResultState(null);
            setResultId(null);
            mockResetResult();
          },
        }),
        [result, loading, error, resultId],
      );

      return <ResultContext.Provider value={contextValue}>{children}</ResultContext.Provider>;
    }

    // Render the hook with the stateful wrapper
    const { result } = renderHook(() => useResult(), { wrapper: TestWrapper });

    // Initial result should be mockResult
    expect(result.current.result).toBe(mockResult);
    expect(result.current.resultId).toBe('result-123');

    // Test setResult function
    const newResult: Result = {
      ...mockResult,
      id: 'result-456',
      boreDiameter: 5.0,
    };

    act(() => {
      result.current.setResult(newResult, true);
    });

    // Result should be updated
    expect(result.current.result).toBe(newResult);
    expect(result.current.resultId).toBe('result-456');
    expect(mockSetResult).toHaveBeenCalledWith(newResult, true);

    // Test setLoading function
    act(() => {
      result.current.setLoading(true);
    });

    // Loading state should be updated
    expect(result.current.loading).toBe(true);
    expect(mockSetLoading).toHaveBeenCalledWith(true);

    // Test setError function
    act(() => {
      result.current.setError('Failed to load result');
    });

    // Error state should be updated
    expect(result.current.error).toBe('Failed to load result');
    expect(mockSetError).toHaveBeenCalledWith('Failed to load result');

    // Test resetResult function
    act(() => {
      result.current.resetResult();
    });

    // Result and resultId should be null
    expect(result.current.result).toBeNull();
    expect(result.current.resultId).toBeNull();
    expect(mockResetResult).toHaveBeenCalled();
  });

  it('handles fetchResult async method', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ResultContext.Provider value={mockResultValue}>{children}</ResultContext.Provider>
    );

    const { result } = renderHook(() => useResult(), { wrapper });

    // Call fetchResult
    let succ: boolean = false;

    await act(async () => {
      succ = await result.current.fetchResult('result-123');
    });

    // Verify fetchResult was called and returned expected value
    expect(mockFetchResult).toHaveBeenCalledWith('result-123');
    expect(succ).toBe(true);
  });

  it('handles null result state', () => {
    // Create context with null result
    const nullResultContext: ResultContextType = {
      ...mockResultValue,
      result: null,
      resultId: null,
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ResultContext.Provider value={nullResultContext}>{children}</ResultContext.Provider>
    );

    const { result } = renderHook(() => useResult(), { wrapper });

    // Verify null result state
    expect(result.current.result).toBeNull();
    expect(result.current.resultId).toBeNull();

    // Verify functions still work
    act(() => {
      result.current.setResult(mockResult);
    });

    expect(mockSetResult).toHaveBeenCalledWith(mockResult);
    expect(mockSetResult).toHaveBeenCalledTimes(1);
  });

  it('handles error state', () => {
    // Create context with error
    const errorContext: ResultContextType = {
      ...mockResultValue,
      error: 'Failed to fetch result',
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ResultContext.Provider value={errorContext}>{children}</ResultContext.Provider>
    );

    const { result } = renderHook(() => useResult(), { wrapper });

    // Verify error state
    expect(result.current.error).toBe('Failed to fetch result');

    // Clear error
    act(() => {
      result.current.setError(null);
    });

    expect(mockSetError).toHaveBeenCalledWith(null);
  });

  it('handles loading state', () => {
    // Create context with loading
    const loadingContext: ResultContextType = {
      ...mockResultValue,
      loading: true,
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ResultContext.Provider value={loadingContext}>{children}</ResultContext.Provider>
    );

    const { result } = renderHook(() => useResult(), { wrapper });

    // Verify loading state
    expect(result.current.loading).toBe(true);

    // Set loading to false
    act(() => {
      result.current.setLoading(false);
    });

    expect(mockSetLoading).toHaveBeenCalledWith(false);
  });
});
