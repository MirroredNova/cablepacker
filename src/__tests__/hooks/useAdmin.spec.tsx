import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import useAdmin from '@/hooks/useAdmin';
import { AdminContext } from '@/context/AdminContext';
import { Preset } from '@/types/domain.types';

describe('useAdmin', () => {
  // Create mock preset for testing
  const mockPreset: Preset = {
    id: 123,
    name: 'Test Preset',
    cables: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Mock admin context value based on actual context type
  const mockAdminValue = {
    selectedPreset: mockPreset,
    selectedPresetId: 123,
    setSelectedPresetId: vi.fn(),
  };

  it('returns the context value when used within AdminContext provider', () => {
    // Wrapper component that provides the admin context
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AdminContext.Provider value={mockAdminValue}>{children}</AdminContext.Provider>
    );

    // Render the hook within the context provider
    const { result } = renderHook(() => useAdmin(), { wrapper });

    // Verify that the hook returns the provided context value
    expect(result.current).toEqual(mockAdminValue);
    expect(result.current.selectedPreset).toBe(mockPreset);
    expect(result.current.selectedPresetId).toBe(123);
    expect(result.current.setSelectedPresetId).toBe(mockAdminValue.setSelectedPresetId);
  });

  it('throws an error when used outside of AdminContext provider', () => {
    // Use console.error spy to suppress the expected error in test output
    const consoleErrorSpy = vi.spyOn(console, 'error');
    consoleErrorSpy.mockImplementation(() => {});

    // Attempt to render the hook without a context provider
    expect(() => {
      renderHook(() => useAdmin());
    }).toThrow('useAdmin must be used within an AdminProvider');

    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  it('correctly handles context state changes', () => {
    // Create an alternative preset for testing state changes
    const alternativePreset: Preset = {
      id: 456,
      name: 'Alternative Preset',
      cables: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Create a wrapper with stateful context for testing changes
    function TestWrapper({ children }: { children: React.ReactNode }) {
      const [selectedPresetId, setSelectedPresetId] = React.useState<number | null>(123);

      // Simulate fetching a preset based on ID
      let selectedPreset;
      if (selectedPresetId === 123) {
        selectedPreset = mockPreset;
      } else if (selectedPresetId === 456) {
        selectedPreset = alternativePreset;
      } else {
        selectedPreset = null;
      }

      const contextValue = React.useMemo(
        () => ({
          selectedPreset,
          selectedPresetId,
          setSelectedPresetId,
        }),
        [selectedPreset, selectedPresetId, setSelectedPresetId],
      );

      return <AdminContext.Provider value={contextValue}>{children}</AdminContext.Provider>;
    }

    // Render the hook with the stateful wrapper
    const { result } = renderHook(() => useAdmin(), { wrapper: TestWrapper });

    // Initial state should have the first preset
    expect(result.current.selectedPresetId).toBe(123);
    expect(result.current.selectedPreset).toBe(mockPreset);

    // Change the selected preset ID
    act(() => {
      result.current.setSelectedPresetId(456);
    });

    // After change, should have the alternative preset
    expect(result.current.selectedPresetId).toBe(456);
    expect(result.current.selectedPreset).toBe(alternativePreset);

    // Test setting to null
    act(() => {
      result.current.setSelectedPresetId(null);
    });

    // Should have null preset when ID is null
    expect(result.current.selectedPresetId).toBe(null);
    expect(result.current.selectedPreset).toBe(null);
  });
});
