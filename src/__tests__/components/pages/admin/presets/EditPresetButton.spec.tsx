import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import EditPresetButton from '@/components/pages/admin/presets/EditPresetButton';
import usePreset from '@/hooks/usePreset';
import { Preset } from '@/types/domain.types';

// Mock the usePreset hook
vi.mock('@/hooks/usePreset', () => ({
  default: vi.fn(),
}));

// Mock the EditIcon component
vi.mock('@mui/icons-material/Edit', () => ({
  default: ({ fontSize }: { fontSize?: string }) => (
    <span data-testid="edit-icon" data-font-size={fontSize}>
      Edit Icon
    </span>
  ),
}));

describe('EditPresetButton', () => {
  // Sample preset for testing
  const mockPreset: Preset = {
    id: 456,
    name: 'Test Preset',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  };

  const mockUpdatePreset = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock for usePreset
    (usePreset as any).mockReturnValue({
      updatePreset: mockUpdatePreset,
    });
  });

  it('renders an edit icon button', () => {
    render(<EditPresetButton preset={mockPreset} />);

    const button = screen.getByRole('button', { name: /edit/i });
    expect(button).toBeInTheDocument();

    const icon = screen.getByTestId('edit-icon');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('data-font-size', 'small');
  });

  it('opens a dialog with the current preset name when clicked', async () => {
    render(<EditPresetButton preset={mockPreset} />);

    // Dialog should not be visible initially
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Click the edit button
    await userEvent.click(screen.getByRole('button', { name: /edit/i }));

    // Dialog should be visible now
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Edit Preset')).toBeInTheDocument();

    // Input should be pre-filled with the current preset name
    const input = screen.getByLabelText('Preset Name');
    expect(input).toHaveValue('Test Preset');
  });

  it('updates the preset name when typing in the input', async () => {
    render(<EditPresetButton preset={mockPreset} />);

    // Open the dialog
    await userEvent.click(screen.getByRole('button', { name: /edit/i }));

    // Type in the input to change the name
    const input = screen.getByLabelText('Preset Name');
    await userEvent.clear(input);
    await userEvent.type(input, 'Updated Preset Name');

    expect(input).toHaveValue('Updated Preset Name');
  });

  it('calls updatePreset with correct parameters when Save is clicked', async () => {
    render(<EditPresetButton preset={mockPreset} />);

    // Open the dialog
    await userEvent.click(screen.getByRole('button', { name: /edit/i }));

    // Change the preset name
    const input = screen.getByLabelText('Preset Name');
    await userEvent.clear(input);
    await userEvent.type(input, 'Updated Preset Name');

    // Click the Save button
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    // Check that updatePreset was called with the correct parameters
    expect(mockUpdatePreset).toHaveBeenCalledTimes(1);
    expect(mockUpdatePreset).toHaveBeenCalledWith(456, {
      name: 'Updated Preset Name',
    });

    // Dialog should be closed
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('does not call updatePreset when the preset name is empty', async () => {
    render(<EditPresetButton preset={mockPreset} />);

    // Open the dialog
    await userEvent.click(screen.getByRole('button', { name: /edit/i }));

    // Clear the preset name
    const input = screen.getByLabelText('Preset Name');
    await userEvent.clear(input);

    // Click the Save button
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    // updatePreset should not have been called
    expect(mockUpdatePreset).not.toHaveBeenCalled();

    // Dialog should still be open
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('does not call updatePreset when the preset name contains only whitespace', async () => {
    render(<EditPresetButton preset={mockPreset} />);

    // Open the dialog
    await userEvent.click(screen.getByRole('button', { name: /edit/i }));

    // Set the preset name to whitespace
    const input = screen.getByLabelText('Preset Name');
    await userEvent.clear(input);
    await userEvent.type(input, '   ');

    // Click the Save button
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    // updatePreset should not have been called
    expect(mockUpdatePreset).not.toHaveBeenCalled();

    // Dialog should still be open
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('closes the dialog without saving when Cancel is clicked', async () => {
    render(<EditPresetButton preset={mockPreset} />);

    // Open the dialog
    await userEvent.click(screen.getByRole('button', { name: /edit/i }));

    // Change the preset name
    const input = screen.getByLabelText('Preset Name');
    await userEvent.clear(input);
    await userEvent.type(input, 'Should Not Be Saved');

    // Click the Cancel button
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    // updatePreset should not have been called
    expect(mockUpdatePreset).not.toHaveBeenCalled();

    // Dialog should be closed
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('closes the dialog when clicking outside', async () => {
    render(<EditPresetButton preset={mockPreset} />);

    // Open the dialog
    await userEvent.click(screen.getByRole('button', { name: /edit/i }));

    // Change the preset name
    const input = screen.getByLabelText('Preset Name');
    await userEvent.clear(input);
    await userEvent.type(input, 'Should Not Be Saved');

    // Click outside the dialog (the backdrop)
    await userEvent.click(document.querySelector('.MuiBackdrop-root')!);

    // updatePreset should not have been called
    expect(mockUpdatePreset).not.toHaveBeenCalled();

    // Dialog should be closed
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('stops event propagation when edit button is clicked', () => {
    // Create a parent element with an onClick handler
    const parentClickHandler = vi.fn();

    render(
      <div
        role="button"
        tabIndex={0}
        onClick={parentClickHandler}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            parentClickHandler();
          }
        }}
        data-testid="parent"
      >
        <EditPresetButton preset={mockPreset} />
      </div>,
    );

    // Use a more specific selector to get the edit button
    const editButton = screen.getByTestId('edit-icon').closest('button');
    expect(editButton).not.toBeNull();

    // Click the edit button
    fireEvent.click(editButton!);

    // The parent click handler should not have been called
    expect(parentClickHandler).not.toHaveBeenCalled();

    // The dialog should be open
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
