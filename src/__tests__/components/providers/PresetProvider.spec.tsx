import React, { useContext } from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import PresetProvider from '@/components/providers/PresetProvider';
import { PresetContext } from '@/context/PresetContext';
import { createCableAction, deleteCableAction, updateCableAction } from '@/server/actions/cables.actions';
import {
  createPresetAction,
  deletePresetAction,
  getAllPresetsWithCablesAction,
  updatePresetAction,
} from '@/server/actions/presets.actions';
import { Preset, Cable } from '@/types/domain.types';

// Mock all the server actions
vi.mock('@/server/actions/presets.actions', () => ({
  getAllPresetsWithCablesAction: vi.fn(),
  createPresetAction: vi.fn(),
  updatePresetAction: vi.fn(),
  deletePresetAction: vi.fn(),
}));

vi.mock('@/server/actions/cables.actions', () => ({
  createCableAction: vi.fn(),
  updateCableAction: vi.fn(),
  deleteCableAction: vi.fn(),
}));

// Sample data for testing
const mockPresets: Preset[] = [
  {
    id: 1,
    name: 'Preset 1',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    cables: [
      {
        id: 1,
        presetId: 1,
        name: 'Cable 1',
        category: 'Power',
        diameter: 5,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
      },
      {
        id: 2,
        presetId: 1,
        name: 'Cable 2',
        category: 'Data',
        diameter: 7,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
      },
    ],
  },
  {
    id: 2,
    name: 'Preset 2',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    cables: [
      {
        id: 3,
        presetId: 2,
        name: 'Cable 3',
        category: 'Fiber',
        diameter: 4,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
      },
    ],
  },
];

// Test component that consumes the PresetContext
function TestComponent() {
  const context = useContext(PresetContext);

  if (!context) {
    throw new Error('PresetContext must be used within a PresetProvider');
  }

  const {
    presets,
    presetsLoaded,
    selectedPreset,
    loading,
    error,
    setSelectedPreset,
    resetPresets,
    loadPresets,
    addPreset,
    updatePreset,
    deletePreset,
    addCableToPreset,
    editCable,
    deleteCableFromPreset,
  } = context;

  return (
    <div>
      <div data-testid="presets-data">{JSON.stringify(presets)}</div>
      <div data-testid="presets-loaded">{presetsLoaded.toString()}</div>
      <div data-testid="selected-preset">{selectedPreset ? JSON.stringify(selectedPreset) : 'null'}</div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="error">{error || 'null'}</div>

      <button data-testid="load-presets" type="button" onClick={() => loadPresets()}>
        Load Presets
      </button>

      <button data-testid="add-preset" type="button" onClick={() => addPreset('New Preset')}>
        Add Preset
      </button>

      <button data-testid="update-preset" type="button" onClick={() => updatePreset(1, { name: 'Updated Preset' })}>
        Update Preset
      </button>

      <button data-testid="delete-preset" type="button" onClick={() => deletePreset(1)}>
        Delete Preset
      </button>

      <button data-testid="select-preset" type="button" onClick={() => setSelectedPreset(presets[0] || null)}>
        Select First Preset
      </button>

      <button data-testid="reset-presets" type="button" onClick={() => resetPresets()}>
        Reset Presets
      </button>

      <button
        data-testid="add-cable"
        type="button"
        onClick={() => addCableToPreset(1, {
          presetId: 1,
          name: 'New Cable',
          category: 'Custom',
          diameter: 3,
        })}
      >
        Add Cable
      </button>

      <button
        type="button"
        data-testid="edit-cable"
        onClick={() => editCable(1, { name: 'Edited Cable', diameter: 6 })}
      >
        Edit Cable
      </button>

      <button type="button" data-testid="delete-cable" onClick={() => deleteCableFromPreset(1, 1)}>
        Delete Cable
      </button>
    </div>
  );
}

describe('PresetProvider', () => {
  // Setup console mocks to prevent test noise
  const originalConsoleError = console.error;

  beforeEach(() => {
    console.error = vi.fn();
    vi.clearAllMocks();

    // Default mock implementation for success case
    (getAllPresetsWithCablesAction as any).mockResolvedValue({
      success: true,
      data: mockPresets,
    });
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it('renders children without crashing', () => {
    render(
      <PresetProvider>
        <div data-testid="child-element">Child Content</div>
      </PresetProvider>,
    );

    expect(screen.getByTestId('child-element')).toBeInTheDocument();
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('loads presets on mount', async () => {
    render(
      <PresetProvider>
        <TestComponent />
      </PresetProvider>,
    );

    await waitFor(() => {
      expect(getAllPresetsWithCablesAction).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId('presets-data')).toHaveTextContent(JSON.stringify(mockPresets));
      expect(screen.getByTestId('presets-loaded')).toHaveTextContent('true');
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
  });

  it('handles loading states correctly', async () => {
    // Mock a delay in the API response
    (getAllPresetsWithCablesAction as any).mockImplementation(
      () => new Promise((resolve) => {
        setTimeout(() => {
          resolve({ success: true, data: mockPresets });
        }, 100);
      }),
    );

    render(
      <PresetProvider>
        <TestComponent />
      </PresetProvider>,
    );

    // Initial state should show loading
    expect(screen.getByTestId('loading')).toHaveTextContent('true');

    // After API response, loading should be false
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
      expect(screen.getByTestId('presets-data')).toHaveTextContent(JSON.stringify(mockPresets));
    });
  });

  it('handles errors when loading presets', async () => {
    // Mock error response
    (getAllPresetsWithCablesAction as any).mockResolvedValue({
      success: false,
      error: 'Failed to load presets',
    });

    render(
      <PresetProvider>
        <TestComponent />
      </PresetProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Failed to load presets');
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
  });

  it('handles exceptions when loading presets', async () => {
    // Mock exception
    (getAllPresetsWithCablesAction as any).mockRejectedValue(new Error('Network error'));

    render(
      <PresetProvider>
        <TestComponent />
      </PresetProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Network error');
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
  });

  it('creates a new preset successfully', async () => {
  // Create a serializable version of the preset that matches
  // what JSON.stringify will produce
    const newPreset = {
      id: 3,
      name: 'New Preset',
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
      cables: [],
    };

    // Keep using Date objects in the API response
    (createPresetAction as any).mockResolvedValue({
      success: true,
      data: {
        id: 3,
        name: 'New Preset',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
        cables: [],
      },
    });

    render(
      <PresetProvider>
        <TestComponent />
      </PresetProvider>,
    );

    // Wait for initial presets to load
    await waitFor(() => {
      expect(screen.getByTestId('presets-loaded')).toHaveTextContent('true');
    });

    // Add a new preset
    await act(async () => {
      screen.getByTestId('add-preset').click();
    });

    await waitFor(() => {
      expect(createPresetAction).toHaveBeenCalledWith({ name: 'New Preset' });

      // Check if the new preset was added to the state
      const presetsData = JSON.parse(screen.getByTestId('presets-data').textContent || '[]');
      expect(presetsData).toHaveLength(3);
      expect(presetsData[2]).toEqual(newPreset);
    });
  });

  it('handles error when creating a preset', async () => {
    (createPresetAction as any).mockResolvedValue({
      success: false,
      error: 'Failed to create preset',
    });

    render(
      <PresetProvider>
        <TestComponent />
      </PresetProvider>,
    );

    // Wait for initial presets to load
    await waitFor(() => {
      expect(screen.getByTestId('presets-loaded')).toHaveTextContent('true');
    });

    // Try to add a preset
    await act(async () => {
      screen.getByTestId('add-preset').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Failed to create preset');

      // The presets list should remain unchanged
      const presetsData = JSON.parse(screen.getByTestId('presets-data').textContent || '[]');
      expect(presetsData).toHaveLength(2);
    });
  });

  it('updates a preset correctly', async () => {
    (updatePresetAction as any).mockResolvedValue({
      success: true,
    });

    render(
      <PresetProvider>
        <TestComponent />
      </PresetProvider>,
    );

    // Wait for initial presets to load
    await waitFor(() => {
      expect(screen.getByTestId('presets-loaded')).toHaveTextContent('true');
    });

    // First select a preset
    await act(async () => {
      screen.getByTestId('select-preset').click();
    });

    // Then update it
    await act(async () => {
      screen.getByTestId('update-preset').click();
    });

    await waitFor(() => {
      expect(updatePresetAction).toHaveBeenCalledWith(1, { name: 'Updated Preset' });

      // Check if the preset was updated in state
      const presetsData = JSON.parse(screen.getByTestId('presets-data').textContent || '[]');
      expect(presetsData[0].name).toBe('Updated Preset');

      // Check if selectedPreset was also updated
      const selectedPreset = JSON.parse(screen.getByTestId('selected-preset').textContent || 'null');
      expect(selectedPreset.name).toBe('Updated Preset');
    });
  });

  it('deletes a preset correctly', async () => {
    (deletePresetAction as any).mockResolvedValue({
      success: true,
    });

    render(
      <PresetProvider>
        <TestComponent />
      </PresetProvider>,
    );

    // Wait for initial presets to load
    await waitFor(() => {
      expect(screen.getByTestId('presets-loaded')).toHaveTextContent('true');
    });

    // First select a preset
    await act(async () => {
      screen.getByTestId('select-preset').click();
    });

    // Then delete it
    await act(async () => {
      screen.getByTestId('delete-preset').click();
    });

    await waitFor(() => {
      expect(deletePresetAction).toHaveBeenCalledWith(1);

      // Check if the preset was removed from state
      const presetsData = JSON.parse(screen.getByTestId('presets-data').textContent || '[]');
      expect(presetsData).toHaveLength(1);
      expect(presetsData[0].id).toBe(2);

      // selectedPreset should be null since we deleted the selected preset
      expect(screen.getByTestId('selected-preset').textContent).toBe('null');
    });
  });

  it('adds a cable to a preset', async () => {
    const newCable: Cable = {
      id: 4,
      presetId: 1,
      name: 'New Cable',
      category: 'Custom',
      diameter: 3,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
    };

    (createCableAction as any).mockResolvedValue({
      success: true,
      data: newCable,
    });

    render(
      <PresetProvider>
        <TestComponent />
      </PresetProvider>,
    );

    // Wait for initial presets to load
    await waitFor(() => {
      expect(screen.getByTestId('presets-loaded')).toHaveTextContent('true');
    });

    // First select a preset
    await act(async () => {
      screen.getByTestId('select-preset').click();
    });

    // Then add a cable
    await act(async () => {
      screen.getByTestId('add-cable').click();
    });

    await waitFor(() => {
      expect(createCableAction).toHaveBeenCalledWith({
        presetId: 1,
        name: 'New Cable',
        category: 'Custom',
        diameter: 3,
      });

      // Check if the cable was added to the preset
      const presetsData = JSON.parse(screen.getByTestId('presets-data').textContent || '[]');
      expect(presetsData[0].cables).toHaveLength(3);
      expect(presetsData[0].cables[2].id).toEqual(newCable.id);
      expect(presetsData[0].cables[2].name).toEqual(newCable.name);

      // Check if selectedPreset was also updated
      const selectedPreset = JSON.parse(screen.getByTestId('selected-preset').textContent || 'null');
      expect(selectedPreset.cables).toHaveLength(3);
      expect(selectedPreset.cables[2].id).toEqual(newCable.id);
      expect(selectedPreset.cables[2].name).toEqual(newCable.name);
    });
  });

  it('edits a cable correctly', async () => {
    (updateCableAction as any).mockResolvedValue({
      success: true,
    });

    render(
      <PresetProvider>
        <TestComponent />
      </PresetProvider>,
    );

    // Wait for initial presets to load
    await waitFor(() => {
      expect(screen.getByTestId('presets-loaded')).toHaveTextContent('true');
    });

    // First select a preset
    await act(async () => {
      screen.getByTestId('select-preset').click();
    });

    // Then edit a cable
    await act(async () => {
      screen.getByTestId('edit-cable').click();
    });

    await waitFor(() => {
      expect(updateCableAction).toHaveBeenCalledWith(1, {
        name: 'Edited Cable',
        diameter: 6,
      });

      // Check if the cable was updated in state
      const presetsData = JSON.parse(screen.getByTestId('presets-data').textContent || '[]');
      const updatedCable = presetsData[0].cables.find((c: Cable) => c.id === 1);
      expect(updatedCable.name).toBe('Edited Cable');
      expect(updatedCable.diameter).toBe(6);

      // Check if selectedPreset was also updated
      const selectedPreset = JSON.parse(screen.getByTestId('selected-preset').textContent || 'null');
      const selectedCable = selectedPreset.cables.find((c: Cable) => c.id === 1);
      expect(selectedCable.name).toBe('Edited Cable');
      expect(selectedCable.diameter).toBe(6);
    });
  });

  it('deletes a cable from a preset', async () => {
    (deleteCableAction as any).mockResolvedValue({
      success: true,
    });

    render(
      <PresetProvider>
        <TestComponent />
      </PresetProvider>,
    );

    // Wait for initial presets to load
    await waitFor(() => {
      expect(screen.getByTestId('presets-loaded')).toHaveTextContent('true');
    });

    // First select a preset
    await act(async () => {
      screen.getByTestId('select-preset').click();
    });

    // Then delete a cable
    await act(async () => {
      screen.getByTestId('delete-cable').click();
    });

    await waitFor(() => {
      expect(deleteCableAction).toHaveBeenCalledWith(1);

      // Check if the cable was removed from state
      const presetsData = JSON.parse(screen.getByTestId('presets-data').textContent || '[]');
      expect(presetsData[0].cables).toHaveLength(1);
      expect(presetsData[0].cables[0].id).toBe(2);

      // Check if selectedPreset was also updated
      const selectedPreset = JSON.parse(screen.getByTestId('selected-preset').textContent || 'null');
      expect(selectedPreset.cables).toHaveLength(1);
      expect(selectedPreset.cables[0].id).toBe(2);
    });
  });

  it('resets selected preset correctly', async () => {
    render(
      <PresetProvider>
        <TestComponent />
      </PresetProvider>,
    );

    // Wait for initial presets to load
    await waitFor(() => {
      expect(screen.getByTestId('presets-loaded')).toHaveTextContent('true');
    });

    // First select a preset
    await act(async () => {
      screen.getByTestId('select-preset').click();
    });

    // Verify a preset is selected
    expect(screen.getByTestId('selected-preset').textContent).not.toBe('null');

    // Then reset
    await act(async () => {
      screen.getByTestId('reset-presets').click();
    });

    // Verify selection is cleared
    expect(screen.getByTestId('selected-preset').textContent).toBe('null');
  });

  it('handles rollback on API failure for updatePreset', async () => {
    // Mock for loadPresets to simulate rollback
    (getAllPresetsWithCablesAction as any).mockResolvedValue({
      success: true,
      data: mockPresets,
    });

    // Mock failure for updatePreset
    (updatePresetAction as any).mockResolvedValue({
      success: false,
      error: 'Failed to update preset',
    });

    render(
      <PresetProvider>
        <TestComponent />
      </PresetProvider>,
    );

    // Wait for initial presets to load
    await waitFor(() => {
      expect(screen.getByTestId('presets-loaded')).toHaveTextContent('true');
    });

    // First select a preset
    await act(async () => {
      screen.getByTestId('select-preset').click();
    });

    // Get initial count of loadPresets calls
    const initialLoadCalls = (getAllPresetsWithCablesAction as any).mock.calls.length;

    // Then try to update it
    await act(async () => {
      screen.getByTestId('update-preset').click();
    });

    await waitFor(() => {
      // Should show error
      expect(screen.getByTestId('error')).toHaveTextContent('Failed to update preset');

      // Should have called loadPresets to rollback
      expect(getAllPresetsWithCablesAction).toHaveBeenCalledTimes(initialLoadCalls + 1);
    });
  });

  it('handles rollback on API failure for deletePreset', async () => {
    // Mock failure for deletePreset
    (deletePresetAction as any).mockResolvedValue({
      success: false,
      error: 'Failed to delete preset',
    });

    render(
      <PresetProvider>
        <TestComponent />
      </PresetProvider>,
    );

    // Wait for initial presets to load
    await waitFor(() => {
      expect(screen.getByTestId('presets-loaded')).toHaveTextContent('true');
    });

    // First select a preset
    await act(async () => {
      screen.getByTestId('select-preset').click();
    });

    // Store initial presets data
    const initialPresetsData = screen.getByTestId('presets-data').textContent;

    // Then try to delete it
    await act(async () => {
      screen.getByTestId('delete-preset').click();
    });

    await waitFor(() => {
      // Should show error
      expect(screen.getByTestId('error')).toHaveTextContent('Failed to delete preset');

      // Presets should be rolled back to original state
      expect(screen.getByTestId('presets-data').textContent).toBe(initialPresetsData);
    });
  });

  it('provides context with the expected shape', () => {
    let contextValue: any;

    function ContextInspector() {
      contextValue = useContext(PresetContext);
      return null;
    }

    render(
      <PresetProvider>
        <ContextInspector />
      </PresetProvider>,
    );

    // Check all context properties
    expect(contextValue).toHaveProperty('presets');
    expect(contextValue).toHaveProperty('presetsLoaded');
    expect(contextValue).toHaveProperty('selectedPreset');
    expect(contextValue).toHaveProperty('loading');
    expect(contextValue).toHaveProperty('error');
    expect(contextValue).toHaveProperty('setSelectedPreset');
    expect(contextValue).toHaveProperty('resetPresets');
    expect(contextValue).toHaveProperty('loadPresets');
    expect(contextValue).toHaveProperty('addPreset');
    expect(contextValue).toHaveProperty('updatePreset');
    expect(contextValue).toHaveProperty('deletePreset');
    expect(contextValue).toHaveProperty('addCableToPreset');
    expect(contextValue).toHaveProperty('editCable');
    expect(contextValue).toHaveProperty('deleteCableFromPreset');

    // Check types
    expect(Array.isArray(contextValue.presets)).toBe(true);
    expect(typeof contextValue.presetsLoaded).toBe('boolean');
    expect(typeof contextValue.loadPresets).toBe('function');
    expect(typeof contextValue.addPreset).toBe('function');
    expect(typeof contextValue.updatePreset).toBe('function');
    expect(typeof contextValue.deletePreset).toBe('function');
  });
});
