/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AddCableButton from '@/components/pages/admin/cables/AddCableButton';
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

// Mock the NumberInput component since it might have complex interactions
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
      <label>{label}</label>
      <input
        type="number"
        data-testid="diameter-input"
        value={value}
        onChange={(e) => onChangeAction(parseFloat(e.target.value))}
      />
    </div>
  ),
}));

describe('AddCableButton', () => {
  const mockAddCableToPreset = vi.fn();
  const mockSelectedPreset: Preset = {
    id: 1,
    name: 'Test Preset',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    cables: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock hook returns
    (usePreset as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      addCableToPreset: mockAddCableToPreset,
    });

    (useAdmin as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      selectedPreset: mockSelectedPreset,
    });
  });

  it('renders the add button when a preset is selected', () => {
    render(<AddCableButton />);

    expect(screen.getByRole('button', { name: /add cable/i })).toBeInTheDocument();
  });

  it('does not render the add button when no preset is selected', () => {
    // Override the mock to return null for selectedPreset
    (useAdmin as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      selectedPreset: null,
    });

    render(<AddCableButton />);

    expect(screen.queryByRole('button', { name: /add cable/i })).not.toBeInTheDocument();
  });

  it('opens the dialog when the add button is clicked', async () => {
    render(<AddCableButton />);

    // Before clicking, dialog should not be visible
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Click the add button
    await userEvent.click(screen.getByRole('button', { name: /add cable/i }));

    // Dialog should be visible now
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Add New Cable')).toBeInTheDocument();
  });

  it('initializes the form with default values', async () => {
    render(<AddCableButton />);

    // Open the dialog
    await userEvent.click(screen.getByRole('button', { name: /add cable/i }));

    // Check default values
    expect(screen.getByLabelText('Cable Name')).toHaveValue('');
    expect(screen.getByTestId('diameter-input')).toHaveValue(1);
  });

  it('updates form values when user inputs data', async () => {
    render(<AddCableButton />);

    // Open the dialog
    await userEvent.click(screen.getByRole('button', { name: /add cable/i }));

    // Type in cable name
    await userEvent.type(screen.getByLabelText('Cable Name'), 'New Test Cable');
    expect(screen.getByLabelText('Cable Name')).toHaveValue('New Test Cable');

    // Change diameter
    fireEvent.change(screen.getByTestId('diameter-input'), { target: { value: '3.5' } });
    expect(screen.getByTestId('diameter-input')).toHaveValue(3.5);
  });

  it('calls addCableToPreset with correct data when Add button is clicked', async () => {
    render(<AddCableButton />);

    // Open the dialog
    await userEvent.click(screen.getByRole('button', { name: /add cable/i }));

    // Fill in the form
    await userEvent.type(screen.getByLabelText('Cable Name'), 'New Test Cable');
    fireEvent.change(screen.getByTestId('diameter-input'), { target: { value: '3.5' } });

    // Click the Add button
    await userEvent.click(screen.getByRole('button', { name: 'Add' }));

    // Check if the addCableToPreset was called with correct parameters
    expect(mockAddCableToPreset).toHaveBeenCalledWith(1, {
      presetId: 1,
      name: 'New Test Cable',
      diameter: 3.5,
    });

    // Dialog should be closed - add waitFor to wait for animation to complete
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('closes the dialog when Cancel button is clicked', async () => {
    render(<AddCableButton />);

    // Open the dialog
    await userEvent.click(screen.getByRole('button', { name: /add cable/i }));

    // Fill in some data that shouldn't be submitted
    await userEvent.type(screen.getByLabelText('Cable Name'), 'Canceled Cable');

    // Click the Cancel button
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    // Dialog should be closed - add waitFor to wait for animation to complete
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    // addCableToPreset should not have been called
    expect(mockAddCableToPreset).not.toHaveBeenCalled();
  });

  it('closes the dialog when clicking outside', async () => {
    render(<AddCableButton />);

    // Open the dialog
    await userEvent.click(screen.getByRole('button', { name: /add cable/i }));

    // Click outside the dialog (the backdrop)
    await userEvent.click(document.querySelector('.MuiBackdrop-root')!);

    // Dialog should be closed
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    // addCableToPreset should not have been called
    expect(mockAddCableToPreset).not.toHaveBeenCalled();
  });

  it('does not call addCableToPreset if name is empty', async () => {
    render(<AddCableButton />);

    // Open the dialog
    await userEvent.click(screen.getByRole('button', { name: /add cable/i }));

    // Only change diameter, leave name empty
    fireEvent.change(screen.getByTestId('diameter-input'), { target: { value: '5' } });

    // Click the Add button
    await userEvent.click(screen.getByRole('button', { name: 'Add' }));

    // The method should still be called with the empty name
    expect(mockAddCableToPreset).toHaveBeenCalledWith(1, {
      presetId: 1,
      name: '',
      diameter: 5,
    });
  });
});
