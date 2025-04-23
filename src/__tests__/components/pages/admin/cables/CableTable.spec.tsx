import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CableTable from '@/components/pages/admin/cables/CableTable';
import useAdmin from '@/hooks/useAdmin';
import { Preset, Cable } from '@/types/domain.types';

// Mock the useAdmin hook
vi.mock('@/hooks/useAdmin', () => ({
  default: vi.fn(),
}));

// Mock the child components
vi.mock('@/components/pages/admin/cables/EditCableButton', () => ({
  default: ({ cable }: { cable: Cable }) => (
    <button type="button" data-testid={`edit-cable-${cable.id}`}>
      Edit
      {cable.name}
    </button>
  ),
}));

vi.mock('@/components/pages/admin/cables/DeleteCableButton', () => ({
  default: ({ cable }: { cable: Cable }) => (
    <button type="button" data-testid={`delete-cable-${cable.id}`}>
      Delete
      {cable.name}
    </button>
  ),
}));

describe('CableTable', () => {
  // Sample data for testing
  const mockCables: Cable[] = [
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
      diameter: 7.5,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
    },
  ];

  const mockPresetWithCables: Preset = {
    id: 1,
    name: 'Test Preset',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    cables: mockCables,
  };

  const mockEmptyPreset: Preset = {
    id: 2,
    name: 'Empty Preset',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    cables: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a message when no preset is selected', () => {
    // Set up the mock to return no selected preset
    (useAdmin as any).mockReturnValue({
      selectedPreset: null,
    });

    render(<CableTable />);

    // Check for the message
    expect(screen.getByText('Select a preset from the list to view and edit its cables')).toBeInTheDocument();

    // Make sure the table is not rendered
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('renders a table with cable data when a preset with cables is selected', () => {
    // Set up the mock to return a preset with cables
    (useAdmin as any).mockReturnValue({
      selectedPreset: mockPresetWithCables,
    });

    render(<CableTable />);

    // Check for table headers
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Diameter')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();

    // Check for the right number of rows
    const rows = screen.getAllByRole('row');
    // +1 for the header row
    expect(rows).toHaveLength(mockCables.length + 1);

    // Check that each cable is displayed
    mockCables.forEach((cable) => {
      expect(screen.getByText(cable.name)).toBeInTheDocument();
      expect(screen.getByText(cable.diameter.toString())).toBeInTheDocument();

      // Check for action buttons
      expect(screen.getByTestId(`edit-cable-${cable.id}`)).toBeInTheDocument();
      expect(screen.getByTestId(`delete-cable-${cable.id}`)).toBeInTheDocument();
    });

    // The empty state message should not be shown
    expect(screen.queryByText('No cables in this preset. Add one to get started.')).not.toBeInTheDocument();
  });

  it('renders an empty state message when a preset with no cables is selected', () => {
    // Set up the mock to return an empty preset
    (useAdmin as any).mockReturnValue({
      selectedPreset: mockEmptyPreset,
    });

    render(<CableTable />);

    // Check for table headers
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Diameter')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();

    // Check for the empty state message
    expect(screen.getByText('No cables in this preset. Add one to get started.')).toBeInTheDocument();

    // No cable data should be shown
    expect(screen.queryByText('Cable 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Cable 2')).not.toBeInTheDocument();
  });

  it('handles a preset with undefined cables', () => {
    // Create a preset with undefined cables
    const presetWithUndefinedCables = {
      ...mockPresetWithCables,
      cables: undefined,
    };

    // Set up the mock
    (useAdmin as any).mockReturnValue({
      selectedPreset: presetWithUndefinedCables,
    });

    render(<CableTable />);

    // Table should still render
    expect(screen.getByRole('table')).toBeInTheDocument();

    // The empty state message should be shown
    expect(screen.getByText('No cables in this preset. Add one to get started.')).toBeInTheDocument();
  });

  it('handles different cable diameters correctly', () => {
    // Create a preset with cables having various diameter formats
    const cablesWithDifferentDiameters: Cable[] = [
      {
        id: 1,
        presetId: 1,
        name: 'Integer Cable',
        category: 'Power',
        diameter: 5,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
      },
      {
        id: 2,
        presetId: 1,
        name: 'Decimal Cable',
        category: 'Data',
        diameter: 7.5,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
      },
    ];

    const presetWithVariousDiameters = {
      ...mockPresetWithCables,
      cables: cablesWithDifferentDiameters,
    };

    // Set up the mock
    (useAdmin as any).mockReturnValue({
      selectedPreset: presetWithVariousDiameters,
    });

    render(<CableTable />);

    // Check that diameters are displayed correctly
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('7.5')).toBeInTheDocument();
  });
});
