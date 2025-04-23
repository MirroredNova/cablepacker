import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PresetsTable from '@/components/pages/admin/presets/PresetsTable';
import usePreset from '@/hooks/usePreset';
import useAdmin from '@/hooks/useAdmin';
import { Preset } from '@/types/domain.types';

// Mock the hooks
vi.mock('@/hooks/usePreset', () => ({
  default: vi.fn(),
}));

vi.mock('@/hooks/useAdmin', () => ({
  default: vi.fn(),
}));

// Mock the child components
vi.mock('@/components/pages/admin/presets/EditPresetButton', () => ({
  default: ({ preset }: { preset: Preset }) => (
    <button type="button" data-testid={`edit-preset-${preset.id}`}>
      Edit
      {preset.name}
    </button>
  ),
}));

vi.mock('@/components/pages/admin/presets/DeletePresetButton', () => ({
  default: ({ preset }: { preset: Preset }) => (
    <button type="button" data-testid={`delete-preset-${preset.id}`}>
      Delete
      {preset.name}
    </button>
  ),
}));

describe('PresetsTable', () => {
  // Sample presets for testing
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
          diameter: 3,
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
      cables: [],
    },
    {
      id: 3,
      name: 'Preset 3',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
      cables: undefined,
    },
  ];

  const mockSetSelectedPresetId = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock hook returns
    (usePreset as any).mockReturnValue({
      presets: mockPresets,
    });

    (useAdmin as any).mockReturnValue({
      setSelectedPresetId: mockSetSelectedPresetId,
    });
  });

  it('renders a message when no presets are available', () => {
    // Override the mock to return an empty presets array
    (usePreset as any).mockReturnValue({
      presets: [],
    });

    render(<PresetsTable />);

    expect(screen.getByText('No presets available. Add one to get started.')).toBeInTheDocument();
  });

  it('renders a list of presets when presets are available', () => {
    render(<PresetsTable />);

    // Check that all presets are rendered
    expect(screen.getByText('Preset 1')).toBeInTheDocument();
    expect(screen.getByText('Preset 2')).toBeInTheDocument();
    expect(screen.getByText('Preset 3')).toBeInTheDocument();

    // Check that cable counts are displayed
    expect(screen.getByText('2 cables')).toBeInTheDocument();
    // Use getAllByText for "0 cables" since it appears multiple times
    const zeroCablesElements = screen.getAllByText('0 cables');
    expect(zeroCablesElements).toHaveLength(2);

    // The empty message should not be shown
    expect(screen.queryByText('No presets available. Add one to get started.')).not.toBeInTheDocument();
  });

  it('calls setSelectedPresetId when a preset is clicked', () => {
    render(<PresetsTable />);

    // Click on the first preset
    fireEvent.click(screen.getByText('Preset 1'));

    // Check that setSelectedPresetId was called with the correct ID
    expect(mockSetSelectedPresetId).toHaveBeenCalledTimes(1);
    expect(mockSetSelectedPresetId).toHaveBeenCalledWith(1);

    // Click on another preset
    fireEvent.click(screen.getByText('Preset 2'));

    // Check that setSelectedPresetId was called again with the correct ID
    expect(mockSetSelectedPresetId).toHaveBeenCalledTimes(2);
    expect(mockSetSelectedPresetId).toHaveBeenCalledWith(2);
  });

  it('renders edit and delete buttons for each preset', () => {
    render(<PresetsTable />);

    // Check that edit buttons exist for each preset
    expect(screen.getByTestId('edit-preset-1')).toBeInTheDocument();
    expect(screen.getByTestId('edit-preset-2')).toBeInTheDocument();
    expect(screen.getByTestId('edit-preset-3')).toBeInTheDocument();

    // Check that delete buttons exist for each preset
    expect(screen.getByTestId('delete-preset-1')).toBeInTheDocument();
    expect(screen.getByTestId('delete-preset-2')).toBeInTheDocument();
    expect(screen.getByTestId('delete-preset-3')).toBeInTheDocument();
  });

  it('handles presets with undefined cables array', () => {
    render(<PresetsTable />);

    // Preset 3 has undefined cables
    // The component should handle this gracefully and display "0 cables"
    const presetItems = screen.getAllByRole('listitem');
    expect(presetItems.length).toBe(3);

    // Find the item with Preset 3
    const preset3Item = presetItems.find((item) => item.textContent?.includes('Preset 3'));
    expect(preset3Item).toBeDefined();
    expect(preset3Item?.textContent).toContain('0 cables');
  });

  it('renders the correct number of list items', () => {
    render(<PresetsTable />);

    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(mockPresets.length);
  });
});
