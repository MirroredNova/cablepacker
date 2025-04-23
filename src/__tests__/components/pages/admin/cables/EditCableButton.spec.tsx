import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import EditCableButton from '@/components/pages/admin/cables/EditCableButton';
import useAdmin from '@/hooks/useAdmin';
import usePreset from '@/hooks/usePreset';
import { Cable, Preset } from '@/types/domain.types';

// Mock the hooks
vi.mock('@/hooks/useAdmin', () => ({
  default: vi.fn(),
}));

vi.mock('@/hooks/usePreset', () => ({
  default: vi.fn(),
}));

// Mock the EnhancedNumberInput component
vi.mock('@/components/shared/NumberInput', () => ({
  default: ({
    label,
    value,
    onChangeAction,
  }: {
    label: string;
    value: number;
    onChangeAction: (value: number) => void;
  }) => (
    <div data-testid="number-input">
      <label htmlFor="diameter-input">{label}</label>
      <input
        id="diameter-input"
        type="number"
        data-testid="diameter-input"
        value={value}
        onChange={(e) => onChangeAction(parseFloat(e.target.value))}
      />
    </div>
  ),
}));

// Mock the MUI icon components for simplicity
vi.mock('@mui/icons-material/Edit', () => ({
  default: () => <span data-testid="edit-icon">Edit Icon</span>,
}));

describe('EditCableButton', () => {
  const mockCable: Cable = {
    id: 123,
    presetId: 456,
    name: 'Test Cable',
    category: 'Power',
    diameter: 5,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  };

  const mockPreset: Preset = {
    id: 456,
    name: 'Test Preset',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    cables: [mockCable],
  };

  const mockEditCable = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock hook returns
    (useAdmin as any).mockReturnValue({
      selectedPreset: mockPreset,
    });

    (usePreset as any).mockReturnValue({
      editCable: mockEditCable,
    });
  });

  it('renders an edit icon button', () => {
    render(<EditCableButton cable={mockCable} />);

    const iconButton = screen.getByRole('button', { name: /edit/i });
    expect(iconButton).toBeInTheDocument();

    const editIcon = screen.getByTestId('edit-icon');
    expect(editIcon).toBeInTheDocument();
  });

  it('opens a dialog when the edit button is clicked', async () => {
    render(<EditCableButton cable={mockCable} />);

    // Dialog should not be visible initially
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Click the edit button
    await userEvent.click(screen.getByRole('button', { name: /edit/i }));

    // Dialog should be visible now
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Edit Cable')).toBeInTheDocument();
  });

  it('initializes the form with the cable values', async () => {
    render(<EditCableButton cable={mockCable} />);

    // Open the dialog
    await userEvent.click(screen.getByRole('button', { name: /edit/i }));

    // Check initial values
    expect(screen.getByLabelText('Cable Name')).toHaveValue('Test Cable');
    expect(screen.getByTestId('diameter-input')).toHaveValue(5);
  });

  it('updates form values when user inputs data', async () => {
    render(<EditCableButton cable={mockCable} />);

    // Open the dialog
    await userEvent.click(screen.getByRole('button', { name: /edit/i }));

    // Change the cable name
    await userEvent.clear(screen.getByLabelText('Cable Name'));
    await userEvent.type(screen.getByLabelText('Cable Name'), 'Updated Cable Name');
    expect(screen.getByLabelText('Cable Name')).toHaveValue('Updated Cable Name');

    // Change the diameter
    fireEvent.change(screen.getByTestId('diameter-input'), { target: { value: '7.5' } });
    expect(screen.getByTestId('diameter-input')).toHaveValue(7.5);
  });

  it('calls editCable with correct parameters when Save button is clicked', async () => {
    render(<EditCableButton cable={mockCable} />);

    // Open the dialog
    await userEvent.click(screen.getByRole('button', { name: /edit/i }));

    // Update the form values
    await userEvent.clear(screen.getByLabelText('Cable Name'));
    await userEvent.type(screen.getByLabelText('Cable Name'), 'Updated Cable Name');
    fireEvent.change(screen.getByTestId('diameter-input'), { target: { value: '7.5' } });

    // Click the Save button
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    // Check if editCable was called
    expect(mockEditCable).toHaveBeenCalledTimes(1);

    // Use a more flexible approach for checking what was passed to the function
    expect(mockEditCable).toHaveBeenCalledWith(
      123,
      expect.objectContaining({
        name: 'Updated Cable Name',
        diameter: 7.5,
      }),
    );

    // Dialog should be closed
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('closes the dialog without saving when Cancel button is clicked', async () => {
    render(<EditCableButton cable={mockCable} />);

    // Open the dialog
    await userEvent.click(screen.getByRole('button', { name: /edit/i }));

    // Make some changes
    await userEvent.clear(screen.getByLabelText('Cable Name'));
    await userEvent.type(screen.getByLabelText('Cable Name'), 'Changes that should not be saved');

    // Click the Cancel button
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    // editCable should not have been called
    expect(mockEditCable).not.toHaveBeenCalled();

    // Dialog should be closed
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('handles a cable with null category', async () => {
    const cableWithNullCategory = {
      ...mockCable,
      category: null,
    };

    render(<EditCableButton cable={cableWithNullCategory} />);

    // Open the dialog
    await userEvent.click(screen.getByRole('button', { name: /edit/i }));

    // Make changes and save
    await userEvent.clear(screen.getByLabelText('Cable Name'));
    await userEvent.type(screen.getByLabelText('Cable Name'), 'Updated Cable');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    // Check that editCable was called with the correct parameters
    expect(mockEditCable).toHaveBeenCalledWith(
      123,
      expect.objectContaining({
        name: 'Updated Cable',
        category: undefined,
      }),
    );
  });

  it('does not call editCable when no preset is selected', async () => {
    // Mock useAdmin to return null for selectedPreset
    (useAdmin as any).mockReturnValue({
      selectedPreset: null,
    });

    render(<EditCableButton cable={mockCable} />);

    // Open the dialog
    await userEvent.click(screen.getByRole('button', { name: /edit/i }));

    // Make changes and try to save
    await userEvent.clear(screen.getByLabelText('Cable Name'));
    await userEvent.type(screen.getByLabelText('Cable Name'), 'Updated Cable');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    // editCable should not have been called
    expect(mockEditCable).not.toHaveBeenCalled();
  });

  it('closes the dialog when clicking outside', async () => {
    render(<EditCableButton cable={mockCable} />);

    // Open the dialog
    await userEvent.click(screen.getByRole('button', { name: /edit/i }));

    // Make some changes
    await userEvent.clear(screen.getByLabelText('Cable Name'));
    await userEvent.type(screen.getByLabelText('Cable Name'), 'Changes that should not be saved');

    // Click outside the dialog (the backdrop)
    await userEvent.click(document.querySelector('.MuiBackdrop-root')!);

    // Dialog should be closed
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    // editCable should not have been called
    expect(mockEditCable).not.toHaveBeenCalled();
  });
});
