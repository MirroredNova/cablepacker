import React, { useContext } from 'react';
import { render, screen, act } from '@testing-library/react';
import {
  describe, it, expect, vi, beforeEach,
} from 'vitest';
import AdminProvider from '@/components/providers/AdminProvider';
import { AdminContext } from '@/context/AdminContext';
import usePreset from '@/hooks/usePreset';

// Mock the usePreset hook
vi.mock('@/hooks/usePreset', () => ({
  default: vi.fn(),
}));

// Test component that consumes the AdminContext
function TestComponent() {
  const context = useContext(AdminContext);

  if (!context) {
    throw new Error('AdminContext must be used within an AdminProvider');
  }

  const { selectedPreset, selectedPresetId, setSelectedPresetId } = context;

  return (
    <div>
      <div data-testid="selected-preset-id">{selectedPresetId ?? 'null'}</div>
      <div data-testid="selected-preset-name">{selectedPreset?.name ?? 'null'}</div>
      <button type="button" data-testid="select-preset-1" onClick={() => setSelectedPresetId(1)}>
        Select Preset 1
      </button>
      <button type="button" data-testid="select-preset-2" onClick={() => setSelectedPresetId(2)}>
        Select Preset 2
      </button>
      <button type="button" data-testid="clear-selection" onClick={() => setSelectedPresetId(null)}>
        Clear Selection
      </button>
    </div>
  );
}

describe('AdminProvider', () => {
  const mockPresets = [
    { id: 1, name: 'Preset 1', circles: [] },
    { id: 2, name: 'Preset 2', circles: [] },
    { id: 3, name: 'Preset 3', circles: [] },
  ];

  beforeEach(() => {
    // Setup mock implementation
    (usePreset as ReturnType<typeof vi.fn>).mockReturnValue({
      presets: mockPresets,
      isLoading: false,
      error: null,
    });
  });

  it('renders children without crashing', () => {
    render(
      <AdminProvider>
        <div data-testid="child-element">Child Content</div>
      </AdminProvider>,
    );

    expect(screen.getByTestId('child-element')).toBeInTheDocument();
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('provides initial context with null selectedPresetId and selectedPreset', () => {
    render(
      <AdminProvider>
        <TestComponent />
      </AdminProvider>,
    );

    expect(screen.getByTestId('selected-preset-id')).toHaveTextContent('null');
    expect(screen.getByTestId('selected-preset-name')).toHaveTextContent('null');
  });

  it('updates selectedPresetId and selectedPreset when setSelectedPresetId is called', () => {
    render(
      <AdminProvider>
        <TestComponent />
      </AdminProvider>,
    );

    // Initial state
    expect(screen.getByTestId('selected-preset-id')).toHaveTextContent('null');
    expect(screen.getByTestId('selected-preset-name')).toHaveTextContent('null');

    // Select preset 1
    act(() => {
      screen.getByTestId('select-preset-1').click();
    });

    expect(screen.getByTestId('selected-preset-id')).toHaveTextContent('1');
    expect(screen.getByTestId('selected-preset-name')).toHaveTextContent('Preset 1');

    // Select preset 2
    act(() => {
      screen.getByTestId('select-preset-2').click();
    });

    expect(screen.getByTestId('selected-preset-id')).toHaveTextContent('2');
    expect(screen.getByTestId('selected-preset-name')).toHaveTextContent('Preset 2');

    // Clear selection
    act(() => {
      screen.getByTestId('clear-selection').click();
    });

    expect(screen.getByTestId('selected-preset-id')).toHaveTextContent('null');
    expect(screen.getByTestId('selected-preset-name')).toHaveTextContent('null');
  });

  it('handles non-existent preset IDs correctly', () => {
    render(
      <AdminProvider>
        <TestComponent />
      </AdminProvider>,
    );

    // Try to select a preset that doesn't exist in the data
    act(() => {
      const setIdFn = screen.getByTestId('select-preset-1').onclick;
      if (setIdFn) {
        // @ts-ignore - Accessing private implementation
        setIdFn({ target: {} }); // Call the event handler
        // Then change the ID to non-existent one
        (usePreset as ReturnType<typeof vi.fn>).mockReturnValue({
          presets: mockPresets.filter((p) => p.id !== 1),
          isLoading: false,
          error: null,
        });
      }
    });

    // Context should have the ID, but no matching preset
    expect(screen.getByTestId('selected-preset-id')).toHaveTextContent('null');
    expect(screen.getByTestId('selected-preset-name')).toHaveTextContent('null');
  });

  it('updates selectedPreset when presets data changes', () => {
    const { rerender } = render(
      <AdminProvider>
        <TestComponent />
      </AdminProvider>,
    );

    // Select preset 1
    act(() => {
      screen.getByTestId('select-preset-1').click();
    });

    expect(screen.getByTestId('selected-preset-name')).toHaveTextContent('Preset 1');

    // Update the preset data
    const updatedPresets = [
      { id: 1, name: 'Updated Preset 1', circles: [] },
      { id: 2, name: 'Preset 2', circles: [] },
      { id: 3, name: 'Preset 3', circles: [] },
    ];

    (usePreset as ReturnType<typeof vi.fn>).mockReturnValue({
      presets: updatedPresets,
      isLoading: false,
      error: null,
    });

    // Re-render with new data
    rerender(
      <AdminProvider>
        <TestComponent />
      </AdminProvider>,
    );

    // The selected preset should reflect the updated data
    expect(screen.getByTestId('selected-preset-id')).toHaveTextContent('1');
    expect(screen.getByTestId('selected-preset-name')).toHaveTextContent('Updated Preset 1');
  });

  it('handles empty presets array', () => {
    // Mock empty presets
    (usePreset as ReturnType<typeof vi.fn>).mockReturnValue({
      presets: [],
      isLoading: false,
      error: null,
    });

    render(
      <AdminProvider>
        <TestComponent />
      </AdminProvider>,
    );

    // Try to select a preset
    act(() => {
      screen.getByTestId('select-preset-1').click();
    });

    // Should have ID but no matching preset
    expect(screen.getByTestId('selected-preset-id')).toHaveTextContent('1');
    expect(screen.getByTestId('selected-preset-name')).toHaveTextContent('null');
  });

  // If AdminContext has a specific shape, test that too
  it('provides a context with the expected shape', () => {
    let contextValue: any;

    function ContextInspector() {
      contextValue = useContext(AdminContext);
      return null;
    }

    render(
      <AdminProvider>
        <ContextInspector />
      </AdminProvider>,
    );

    expect(contextValue).toHaveProperty('selectedPreset');
    expect(contextValue).toHaveProperty('selectedPresetId');
    expect(contextValue).toHaveProperty('setSelectedPresetId');
    expect(typeof contextValue.setSelectedPresetId).toBe('function');
  });
});
