import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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
      {' '}
      {cable.name}
    </button>
  ),
}));

vi.mock('@/components/pages/admin/cables/DeleteCableButton', () => ({
  default: ({ cable }: { cable: Cable }) => (
    <button type="button" data-testid={`delete-cable-${cable.id}`}>
      Delete
      {' '}
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
    {
      id: 3,
      presetId: 1,
      name: 'Cable 3',
      category: null,
      diameter: 10,
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
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Diameter')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();

    // Check for the right number of rows
    const rows = screen.getAllByRole('row');
    // +1 for the header row
    expect(rows).toHaveLength(mockCables.length + 1);

    // Check that each cable is displayed
    // Update this test in CableTable.spec.tsx
    mockCables.forEach((cable) => {
      expect(screen.getByText(cable.name)).toBeInTheDocument();
      expect(screen.getByText(cable.diameter.toString())).toBeInTheDocument();

      // Check category with a better approach for null values
      if (cable.category) {
        // For non-null categories, find the text directly
        expect(screen.getByText(cable.category)).toBeInTheDocument();
      } else {
        // For null categories, check that the cell exists but is empty
        // Get the row by finding the cable name first
        const row = screen.getByText(cable.name).closest('tr');
        // The category cell should be the second cell in the row
        const categoryCell = row?.querySelectorAll('td')[1];
        expect(categoryCell).toHaveTextContent('');
      }

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
    expect(screen.getByText('Category')).toBeInTheDocument();
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

  // New tests for sorting functionality
  it('sorts cables by name when name header is clicked', () => {
    // Setup mock data with cables in non-alphabetical order
    const unsortedCables: Cable[] = [
      {
        id: 1,
        presetId: 1,
        name: 'Z Cable',
        category: 'Power',
        diameter: 5,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
      },
      {
        id: 2,
        presetId: 1,
        name: 'A Cable',
        category: 'Data',
        diameter: 7.5,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
      },
    ];

    const presetWithUnsortedCables = {
      ...mockPresetWithCables,
      cables: unsortedCables,
    };

    (useAdmin as any).mockReturnValue({
      selectedPreset: presetWithUnsortedCables,
    });

    render(<CableTable />);

    // Initially, A Cable should appear first due to default sorting
    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('A Cable');
    expect(rows[2]).toHaveTextContent('Z Cable');

    // Find and click the name sort button
    const nameHeader = screen.getByText('Name').closest('th');
    const sortButton = nameHeader!.querySelector('button');
    fireEvent.click(sortButton!);

    // Now Z Cable should appear first (desc order)
    const rowsAfterSort = screen.getAllByRole('row');
    expect(rowsAfterSort[1]).toHaveTextContent('Z Cable');
    expect(rowsAfterSort[2]).toHaveTextContent('A Cable');
  });

  it('sorts cables by category when category header is clicked', () => {
    // Setup mock data with different categories
    const categorizedCables: Cable[] = [
      {
        id: 1,
        presetId: 1,
        name: 'Cable 1',
        category: 'Z Category',
        diameter: 5,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
      },
      {
        id: 2,
        presetId: 1,
        name: 'Cable 2',
        category: 'A Category',
        diameter: 7.5,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
      },
    ];

    const presetWithCategorizedCables = {
      ...mockPresetWithCables,
      cables: categorizedCables,
    };

    (useAdmin as any).mockReturnValue({
      selectedPreset: presetWithCategorizedCables,
    });

    render(<CableTable />);

    // Find and click the category sort button
    const categoryHeader = screen.getByText('Category').closest('th');
    const sortButton = categoryHeader!.querySelector('button');
    fireEvent.click(sortButton!);

    // They should be sorted by category (asc by default)
    const rowsAfterSort = screen.getAllByRole('row');
    expect(rowsAfterSort[1]).toHaveTextContent('A Category');
    expect(rowsAfterSort[2]).toHaveTextContent('Z Category');

    // Click again to sort desc
    fireEvent.click(sortButton!);

    // Now Z Category should be first
    const rowsAfterSecondSort = screen.getAllByRole('row');
    expect(rowsAfterSecondSort[1]).toHaveTextContent('Z Category');
    expect(rowsAfterSecondSort[2]).toHaveTextContent('A Category');
  });

  it('sorts cables by diameter when diameter header is clicked', () => {
    // Setup mock data with different diameters
    const diameteredCables: Cable[] = [
      {
        id: 1,
        presetId: 1,
        name: 'Big Cable',
        category: 'Power',
        diameter: 10,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
      },
      {
        id: 2,
        presetId: 1,
        name: 'Small Cable',
        category: 'Data',
        diameter: 5,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
      },
    ];

    const presetWithDiameteredCables = {
      ...mockPresetWithCables,
      cables: diameteredCables,
    };

    (useAdmin as any).mockReturnValue({
      selectedPreset: presetWithDiameteredCables,
    });

    render(<CableTable />);

    // Find and click the diameter sort button
    const diameterHeader = screen.getByText('Diameter').closest('th');
    const sortButton = diameterHeader!.querySelector('button');
    fireEvent.click(sortButton!);

    // They should be sorted by diameter (asc by default)
    const rowsAfterSort = screen.getAllByRole('row');
    expect(rowsAfterSort[1]).toHaveTextContent('Small Cable');
    expect(rowsAfterSort[2]).toHaveTextContent('Big Cable');

    // Click again to sort desc
    fireEvent.click(sortButton!);

    // Now big cable should be first
    const rowsAfterSecondSort = screen.getAllByRole('row');
    expect(rowsAfterSecondSort[1]).toHaveTextContent('Big Cable');
    expect(rowsAfterSecondSort[2]).toHaveTextContent('Small Cable');
  });

  it('correctly handles empty categories when sorting', () => {
    // Setup mock data with null categories
    const mixedCategoryCables: Cable[] = [
      {
        id: 1,
        presetId: 1,
        name: 'Cable with category',
        category: 'Some category',
        diameter: 5,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
      },
      {
        id: 2,
        presetId: 1,
        name: 'Cable without category',
        category: null,
        diameter: 7.5,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
      },
    ];

    const presetWithMixedCategories = {
      ...mockPresetWithCables,
      cables: mixedCategoryCables,
    };

    (useAdmin as any).mockReturnValue({
      selectedPreset: presetWithMixedCategories,
    });

    render(<CableTable />);

    // Find and click the category sort button
    const categoryHeader = screen.getByText('Category').closest('th');
    const sortButton = categoryHeader!.querySelector('button');
    fireEvent.click(sortButton!);

    // Empty category should come first in asc order
    const rowsAfterSort = screen.getAllByRole('row');
    expect(rowsAfterSort[1]).toHaveTextContent('Cable without category');
    expect(rowsAfterSort[2]).toHaveTextContent('Cable with category');
  });
});
