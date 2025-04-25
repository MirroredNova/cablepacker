import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CableTableRow from '@/components/pages/home/table/CableTableRow';
import useTable from '@/hooks/useTable';
import usePreset from '@/hooks/usePreset';
import { Cable } from '@/types/domain.types';
import { TableRowData } from '@/types/table.types';

// Mock the hooks and child components
vi.mock('@/hooks/useTable', () => ({
  default: vi.fn(),
}));

vi.mock('@/hooks/usePreset', () => ({
  default: vi.fn(),
}));

vi.mock('@/components/shared/NumberInput', () => ({
  default: ({ value, onChangeAction, min, name }: any) => (
    <input
      type="number"
      value={value}
      data-testid={`number-input-${name}`}
      data-min={min}
      onChange={(e) => onChangeAction(parseFloat(e.target.value))}
    />
  ),
}));

// Mock MUI components for easier testing
vi.mock('@mui/material/Autocomplete', () => ({
  default: ({ value, options, onChange, getOptionLabel, disabled }: any) => (
    <select
      data-testid="cable-select"
      value={value?.id ?? ''}
      disabled={disabled}
      onChange={(e) => {
        const selectedOption = options.find((opt: any) => opt.id.toString() === e.target.value);
        onChange({}, selectedOption);
      }}
    >
      {options.map((option: any) => (
        <option key={option.id} value={option.id}>
          {getOptionLabel(option)}
        </option>
      ))}
    </select>
  ),
}));

vi.mock('@mui/material/TextField', () => ({
  default: ({ value, onChange, label, disabled }: any) => (
    <input
      type="text"
      value={value || ''}
      onChange={onChange}
      placeholder={label}
      disabled={disabled}
      data-testid={`text-field-${label?.toLowerCase().replace(/\s+/g, '-')}`}
    />
  ),
}));

vi.mock('@mui/material/IconButton', () => ({
  default: ({ onClick, children, 'aria-label': ariaLabel }: any) => (
    <button type="button" onClick={onClick} aria-label={ariaLabel} data-testid={`button-${ariaLabel}`}>
      {children}
    </button>
  ),
}));

vi.mock('@mui/icons-material/DeleteOutline', () => ({
  default: () => <span>DeleteIcon</span>,
}));

vi.mock('@/config', () => ({
  clientConfig: {
    MAX_DIAMETER: 10,
  },
}));

describe('CableTableRow', () => {
  // Mock hooks return values
  const mockUpdateRow = vi.fn();
  const mockDeleteRow = vi.fn();

  // Sample data
  let mockRow: TableRowData;
  let mockPresetCables: Cable[];

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Setup mock cable preset data
    mockPresetCables = [
      {
        id: 1,
        name: 'Cable Type A',
        diameter: 0.75,
        presetId: 123,
        category: 'Category 1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        name: 'Cable Type B',
        diameter: 1.25,
        presetId: 123,
        category: 'Category 2',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Mock hooks
    (useTable as any).mockReturnValue({
      updateRow: mockUpdateRow,
      deleteRow: mockDeleteRow,
    });

    (usePreset as any).mockReturnValue({
      selectedPreset: {
        id: 123,
        name: 'Test Preset',
        cables: mockPresetCables,
      },
      loading: false,
    });

    // Default row data (preset cable selected)
    mockRow = {
      id: 'row-1',
      selectedCable: mockPresetCables[0],
      quantity: 3,
      customName: '',
      customDiameter: undefined,
    };
  });

  it('renders with preset cable correctly', () => {
    render(<CableTableRow row={mockRow} />);

    // Cable selector should have the preset cable selected
    const cableSelect = screen.getByTestId('cable-select');
    expect(cableSelect).toHaveValue('1'); // First preset cable (id: 1)

    // Should display the diameter without input field
    expect(screen.queryByTestId('number-input-customDiameter')).not.toBeInTheDocument();
    expect(screen.getByText('0.750 in')).toBeInTheDocument();

    // Should have quantity input
    const quantityInput = screen.getByTestId('number-input-quantity');
    expect(quantityInput).toHaveValue(3);

    // Should have delete button
    const deleteButton = screen.getByTestId('button-delete');
    expect(deleteButton).toBeInTheDocument();

    // Custom name field should not be visible
    expect(screen.queryByTestId('text-field-custom-name')).not.toBeInTheDocument();
  });

  it('renders with custom cable correctly', () => {
    // Custom cable configuration
    mockRow = {
      id: 'row-2',
      selectedCable: 'custom',
      quantity: 2,
      customName: 'My Custom Cable',
      customDiameter: 1.5,
    };

    render(<CableTableRow row={mockRow} />);

    // Cable selector should have "Custom" option selected (id: -1)
    const cableSelect = screen.getByTestId('cable-select');
    expect(cableSelect).toHaveValue('-1');

    // Should display the diameter input field
    const diameterInput = screen.getByTestId('number-input-customDiameter');
    expect(diameterInput).toBeInTheDocument();
    expect(diameterInput).toHaveValue(1.5);

    // Should have quantity input
    const quantityInput = screen.getByTestId('number-input-quantity');
    expect(quantityInput).toHaveValue(2);

    // Custom name field should be visible with correct value
    const customNameField = screen.getByTestId('text-field-custom-name');
    expect(customNameField).toBeInTheDocument();
    expect(customNameField).toHaveValue('My Custom Cable');
  });

  it('calls updateRow when changing the cable type', () => {
    render(<CableTableRow row={mockRow} />);

    // Change cable type to the second preset option
    const cableSelect = screen.getByTestId('cable-select');
    fireEvent.change(cableSelect, { target: { value: '2' } });

    // Should update row with the selected cable
    expect(mockUpdateRow).toHaveBeenCalledWith('row-1', {
      selectedCable: mockPresetCables[1],
    });
  });

  it('calls updateRow when changing to custom cable type', () => {
    render(<CableTableRow row={mockRow} />);

    // Change to custom cable option
    const cableSelect = screen.getByTestId('cable-select');
    fireEvent.change(cableSelect, { target: { value: '-1' } });

    // Should update row with custom cable settings
    expect(mockUpdateRow).toHaveBeenCalledWith('row-1', {
      selectedCable: 'custom',
      customName: 'Custom', // Default custom name
      customDiameter: 1, // Default diameter
    });
  });

  it('calls updateRow when changing custom cable name', () => {
    // Start with custom cable
    mockRow = {
      id: 'row-2',
      selectedCable: 'custom',
      quantity: 2,
      customName: 'My Custom Cable',
      customDiameter: 1.5,
    };

    render(<CableTableRow row={mockRow} />);

    // Change custom name
    const customNameField = screen.getByTestId('text-field-custom-name');
    fireEvent.change(customNameField, { target: { value: 'New Custom Name' } });

    // Should update row with new name
    expect(mockUpdateRow).toHaveBeenCalledWith('row-2', {
      customName: 'New Custom Name',
    });
  });

  it('calls updateRow when changing custom diameter', () => {
    // Start with custom cable
    mockRow = {
      id: 'row-2',
      selectedCable: 'custom',
      quantity: 2,
      customName: 'My Custom Cable',
      customDiameter: 1.5,
    };

    render(<CableTableRow row={mockRow} />);

    // Change diameter
    const diameterInput = screen.getByTestId('number-input-customDiameter');
    fireEvent.change(diameterInput, { target: { value: '2.5' } });

    // Should update row with new diameter
    expect(mockUpdateRow).toHaveBeenCalledWith('row-2', {
      customDiameter: 2.5,
    });
  });

  it('calls updateRow when changing quantity', () => {
    render(<CableTableRow row={mockRow} />);

    // Change quantity
    const quantityInput = screen.getByTestId('number-input-quantity');
    fireEvent.change(quantityInput, { target: { value: '5' } });

    // Should update row with new quantity
    expect(mockUpdateRow).toHaveBeenCalledWith('row-1', {
      quantity: 5,
    });
  });

  it('calls deleteRow when clicking delete button', () => {
    render(<CableTableRow row={mockRow} />);

    // Click delete button
    const deleteButton = screen.getByTestId('button-delete');
    fireEvent.click(deleteButton);

    // Should call deleteRow with row id
    expect(mockDeleteRow).toHaveBeenCalledWith('row-1');
  });

  it('disables inputs when loading', () => {
    // Mock loading state
    (usePreset as any).mockReturnValue({
      selectedPreset: {
        id: 123,
        name: 'Test Preset',
        cables: mockPresetCables,
      },
      loading: true,
    });

    render(<CableTableRow row={mockRow} />);

    // Cable selector should be disabled
    const cableSelect = screen.getByTestId('cable-select');
    expect(cableSelect).toBeDisabled();
  });

  it('handles case with no preset cables', () => {
    // Mock empty preset
    (usePreset as any).mockReturnValue({
      selectedPreset: {
        id: 123,
        name: 'Test Preset',
        cables: [],
      },
      loading: false,
    });

    render(<CableTableRow row={mockRow} />);

    // Cable selector should only have the custom option
    const cableSelect = screen.getByTestId('cable-select');
    expect(cableSelect.children.length).toBe(1);
  });

  it('uses default values for custom cable when undefined', () => {
    // Custom cable with no defined custom values
    mockRow = {
      id: 'row-3',
      selectedCable: 'custom',
      quantity: 1,
      // customName and customDiameter both undefined
    };

    render(<CableTableRow row={mockRow} />);

    // Diameter should fall back to 1
    const diameterInput = screen.getByTestId('number-input-customDiameter');
    expect(diameterInput).toHaveValue(1);
  });
});
