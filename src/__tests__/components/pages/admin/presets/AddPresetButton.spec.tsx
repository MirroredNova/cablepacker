import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AddPresetButton from '@/components/pages/admin/presets/AddPresetButton';
import usePreset from '@/hooks/usePreset';

// Mock the usePreset hook
vi.mock('@/hooks/usePreset', () => ({
  default: vi.fn(),
}));

// Mock the icon component
vi.mock('@mui/icons-material/Add', () => ({
  default: () => <span data-testid="add-icon">Add Icon</span>,
}));

describe('AddPresetButton', () => {
  const mockAddPreset = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup the mock for usePreset
    (usePreset as any).mockReturnValue({
      addPreset: mockAddPreset,
    });
  });

  it('renders a button to add a preset', () => {
    render(<AddPresetButton />);

    const button = screen.getByRole('button', { name: /add preset/i });
    expect(button).toBeInTheDocument();
    expect(screen.getByTestId('add-icon')).toBeInTheDocument();
  });

  it('opens a dialog when the button is clicked', async () => {
    render(<AddPresetButton />);

    // Dialog should not be visible initially
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Click the add button
    await userEvent.click(screen.getByRole('button', { name: /add preset/i }));

    // Dialog should be visible now
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Add New Preset')).toBeInTheDocument();
    expect(screen.getByLabelText('Preset Name')).toBeInTheDocument();
  });

  it('updates the preset name when typing in the input', async () => {
    render(<AddPresetButton />);

    // Open the dialog
    await userEvent.click(screen.getByRole('button', { name: /add preset/i }));

    // Input should start empty
    const input = screen.getByLabelText('Preset Name');
    expect(input).toHaveValue('');

    // Type in the input
    await userEvent.type(input, 'New Test Preset');
    expect(input).toHaveValue('New Test Preset');
  });

  it('calls addPreset with the preset name when Add button is clicked', async () => {
    render(<AddPresetButton />);

    // Open the dialog
    await userEvent.click(screen.getByRole('button', { name: /add preset/i }));

    // Type a preset name
    await userEvent.type(screen.getByLabelText('Preset Name'), 'New Test Preset');

    // Click the Add button
    await userEvent.click(screen.getByRole('button', { name: 'Add' }));

    // Check if addPreset was called with the correct name
    expect(mockAddPreset).toHaveBeenCalledTimes(1);
    expect(mockAddPreset).toHaveBeenCalledWith('New Test Preset');

    // Dialog should be closed
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('does not call addPreset when the preset name is empty', async () => {
    render(<AddPresetButton />);

    // Open the dialog
    await userEvent.click(screen.getByRole('button', { name: /add preset/i }));

    // Click the Add button without entering a name
    await userEvent.click(screen.getByRole('button', { name: 'Add' }));

    // addPreset should not have been called
    expect(mockAddPreset).not.toHaveBeenCalled();

    // Dialog should still be open
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('does not call addPreset when the preset name contains only whitespace', async () => {
    render(<AddPresetButton />);

    // Open the dialog
    await userEvent.click(screen.getByRole('button', { name: /add preset/i }));

    // Type only spaces
    await userEvent.type(screen.getByLabelText('Preset Name'), '   ');

    // Click the Add button
    await userEvent.click(screen.getByRole('button', { name: 'Add' }));

    // addPreset should not have been called
    expect(mockAddPreset).not.toHaveBeenCalled();

    // Dialog should still be open
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('closes the dialog when Cancel button is clicked', async () => {
    render(<AddPresetButton />);

    // Open the dialog
    await userEvent.click(screen.getByRole('button', { name: /add preset/i }));

    // Type a preset name
    await userEvent.type(screen.getByLabelText('Preset Name'), 'Preset that should not be added');

    // Click the Cancel button
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    // addPreset should not have been called
    expect(mockAddPreset).not.toHaveBeenCalled();

    // Dialog should be closed
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('closes the dialog when clicking outside', async () => {
    render(<AddPresetButton />);

    // Open the dialog
    await userEvent.click(screen.getByRole('button', { name: /add preset/i }));

    // Type a preset name
    await userEvent.type(screen.getByLabelText('Preset Name'), 'Preset that should not be added');

    // Click outside the dialog (the backdrop)
    await userEvent.click(document.querySelector('.MuiBackdrop-root')!);

    // addPreset should not have been called
    expect(mockAddPreset).not.toHaveBeenCalled();

    // Dialog should be closed
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('resets the input field after a successful add', async () => {
    render(<AddPresetButton />);

    // Open the dialog
    await userEvent.click(screen.getByRole('button', { name: /add preset/i }));

    // Type a preset name and add it
    await userEvent.type(screen.getByLabelText('Preset Name'), 'First Preset');
    await userEvent.click(screen.getByRole('button', { name: 'Add' }));

    // Wait for dialog to close
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    // Open the dialog again
    await userEvent.click(screen.getByRole('button', { name: /add preset/i }));

    // Input field should be reset
    expect(screen.getByLabelText('Preset Name')).toHaveValue('');
  });
});
