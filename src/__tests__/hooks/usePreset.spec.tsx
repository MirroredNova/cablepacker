import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import usePreset from '@/hooks/usePreset';
import { PresetContext, PresetContextType } from '@/context/PresetContext';
import { Preset, CreateCableInput, UpdateCableInput } from '@/types/domain.types';

describe('usePreset', () => {
  // Create mock preset for testing
  const mockPreset1: Preset = {
    id: 123,
    name: 'Test Preset 1',
    cables: [
      {
        id: 1,
        name: 'Cable 1',
        diameter: 0.75,
        presetId: 123,
        category: 'Power',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPreset2: Preset = {
    id: 456,
    name: 'Test Preset 2',
    cables: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Setup mock context functions
  const mockSetSelectedPreset = vi.fn();
  const mockResetPresets = vi.fn();
  const mockLoadPresets = vi.fn().mockResolvedValue(undefined);
  const mockAddPreset = vi.fn().mockResolvedValue(undefined);
  const mockUpdatePreset = vi.fn().mockResolvedValue(undefined);
  const mockDeletePreset = vi.fn().mockResolvedValue(undefined);
  const mockAddCableToPreset = vi.fn().mockResolvedValue(undefined);
  const mockEditCable = vi.fn().mockResolvedValue(undefined);
  const mockDeleteCableFromPreset = vi.fn().mockResolvedValue(undefined);

  // Mock preset context value
  let mockPresetValue: PresetContextType;

  beforeEach(() => {
    // Reset all mock functions
    vi.clearAllMocks();

    // Create a fresh context value for each test
    mockPresetValue = {
      presets: [mockPreset1, mockPreset2],
      selectedPreset: mockPreset1,
      presetsLoaded: true,
      loading: false,
      error: null,
      setSelectedPreset: mockSetSelectedPreset,
      resetPresets: mockResetPresets,
      loadPresets: mockLoadPresets,
      addPreset: mockAddPreset,
      updatePreset: mockUpdatePreset,
      deletePreset: mockDeletePreset,
      addCableToPreset: mockAddCableToPreset,
      editCable: mockEditCable,
      deleteCableFromPreset: mockDeleteCableFromPreset,
    };
  });

  it('returns the context value when used within PresetContext provider', () => {
    // Wrapper component that provides the preset context
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <PresetContext.Provider value={mockPresetValue}>
        {children}
      </PresetContext.Provider>
    );

    // Render the hook within the context provider
    const { result } = renderHook(() => usePreset(), { wrapper });

    // Verify that the hook returns the provided context value
    expect(result.current).toEqual(mockPresetValue);
    expect(result.current.presets).toEqual([mockPreset1, mockPreset2]);
    expect(result.current.selectedPreset).toBe(mockPreset1);
    expect(result.current.presetsLoaded).toBe(true);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();

    // Verify that all functions are available
    expect(result.current.setSelectedPreset).toBe(mockSetSelectedPreset);
    expect(result.current.resetPresets).toBe(mockResetPresets);
    expect(result.current.loadPresets).toBe(mockLoadPresets);
    expect(result.current.addPreset).toBe(mockAddPreset);
    expect(result.current.updatePreset).toBe(mockUpdatePreset);
    expect(result.current.deletePreset).toBe(mockDeletePreset);
    expect(result.current.addCableToPreset).toBe(mockAddCableToPreset);
    expect(result.current.editCable).toBe(mockEditCable);
    expect(result.current.deleteCableFromPreset).toBe(mockDeleteCableFromPreset);
  });

  it('throws an error when used outside of PresetContext provider', () => {
    // Use console.error spy to suppress the expected error in test output
    const consoleErrorSpy = vi.spyOn(console, 'error');
    consoleErrorSpy.mockImplementation(() => {});

    // Attempt to render the hook without a context provider
    expect(() => {
      renderHook(() => usePreset());
    }).toThrow('usePresetContext must be used within a PresetProvider');

    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  it('correctly handles state changes', () => {
    // Create a wrapper with stateful context
    function TestWrapper({ children }: { children: React.ReactNode }) {
      const [selectedPreset, setSelectedPresetState] = React.useState<Preset | null>(mockPreset1);

      const contextValue = React.useMemo(() => ({
        ...mockPresetValue,
        selectedPreset,
        setSelectedPreset: (preset: Preset | null) => {
          setSelectedPresetState(preset);
          mockSetSelectedPreset(preset);
        },
      }), [selectedPreset]);

      return (
        <PresetContext.Provider value={contextValue}>
          {children}
        </PresetContext.Provider>
      );
    }

    // Render the hook with the stateful wrapper
    const { result } = renderHook(() => usePreset(), { wrapper: TestWrapper });

    // Initial selected preset should be mockPreset1
    expect(result.current.selectedPreset).toBe(mockPreset1);

    // Change selected preset to mockPreset2
    act(() => {
      result.current.setSelectedPreset(mockPreset2);
    });

    // Selected preset should now be mockPreset2
    expect(result.current.selectedPreset).toBe(mockPreset2);
    expect(mockSetSelectedPreset).toHaveBeenCalledWith(mockPreset2);

    // Change to null (no preset selected)
    act(() => {
      result.current.setSelectedPreset(null);
    });

    // Selected preset should now be null
    expect(result.current.selectedPreset).toBeNull();
    expect(mockSetSelectedPreset).toHaveBeenCalledWith(null);
  });

  it('correctly handles loading and error states', () => {
    // Test with loading state
    const loadingWrapper = ({ children }: { children: React.ReactNode }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const contextValue = React.useMemo(() => ({ ...mockPresetValue, loading: true, error: null }), []);
      return (
        <PresetContext.Provider value={contextValue}>
          {children}
        </PresetContext.Provider>
      );
    };

    const { result: loadingResult } = renderHook(() => usePreset(), { wrapper: loadingWrapper });
    expect(loadingResult.current.loading).toBe(true);
    expect(loadingResult.current.error).toBeNull();

    // Test with error state
    const errorWrapper = ({ children }: { children: React.ReactNode }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const contextValue = React.useMemo(
        () => ({ ...mockPresetValue, loading: false, error: 'Failed to load presets' }),
        [],
      );

      return (
        <PresetContext.Provider value={contextValue}>
          {children}
        </PresetContext.Provider>
      );
    };

    const { result: errorResult } = renderHook(() => usePreset(), { wrapper: errorWrapper });
    expect(errorResult.current.loading).toBe(false);
    expect(errorResult.current.error).toBe('Failed to load presets');
  });

  it('allows calling async methods', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <PresetContext.Provider value={mockPresetValue}>
        {children}
      </PresetContext.Provider>
    );

    const { result } = renderHook(() => usePreset(), { wrapper });

    // Test loadPresets
    await act(async () => {
      await result.current.loadPresets();
    });
    expect(mockLoadPresets).toHaveBeenCalledTimes(1);

    // Test addPreset
    await act(async () => {
      await result.current.addPreset('New Preset');
    });
    expect(mockAddPreset).toHaveBeenCalledWith('New Preset');

    // Test updatePreset
    const updates = { name: 'Updated Name' };
    await act(async () => {
      await result.current.updatePreset(123, updates);
    });
    expect(mockUpdatePreset).toHaveBeenCalledWith(123, updates);

    // Test deletePreset
    await act(async () => {
      await result.current.deletePreset(123);
    });
    expect(mockDeletePreset).toHaveBeenCalledWith(123);

    // Test addCableToPreset
    const newCable: CreateCableInput = {
      name: 'New Cable',
      diameter: 0.5,
      category: 'Data',
      presetId: 0,
    };
    await act(async () => {
      await result.current.addCableToPreset(123, newCable);
    });
    expect(mockAddCableToPreset).toHaveBeenCalledWith(123, newCable);

    // Test editCable
    const cableUpdates: Partial<UpdateCableInput> = {
      name: 'Updated Cable',
      diameter: 0.75,
    };
    await act(async () => {
      await result.current.editCable(1, cableUpdates);
    });
    expect(mockEditCable).toHaveBeenCalledWith(1, cableUpdates);

    // Test deleteCableFromPreset
    await act(async () => {
      await result.current.deleteCableFromPreset(123, 1);
    });
    expect(mockDeleteCableFromPreset).toHaveBeenCalledWith(123, 1);
  });
});
