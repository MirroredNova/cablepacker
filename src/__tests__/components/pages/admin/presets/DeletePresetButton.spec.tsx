import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DeletePresetButton from '@/components/pages/admin/presets/DeletePresetButton';
import usePreset from '@/hooks/usePreset';
import { Preset } from '@/types/domain.types';

// Mock the usePreset hook
vi.mock('@/hooks/usePreset', () => ({
  default: vi.fn(),
}));

// Mock the DeleteIcon component
vi.mock('@mui/icons-material/Delete', () => ({
  default: ({ fontSize }: { fontSize?: string }) => (
    <span data-testid="delete-icon" data-font-size={fontSize}>
      Delete Icon
    </span>
  ),
}));

describe('DeletePresetButton', () => {
  // Sample preset for testing
  const mockPreset: Preset = {
    id: 123,
    name: 'Test Preset',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  };

  const mockDeletePreset = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock for usePreset
    (usePreset as any).mockReturnValue({
      deletePreset: mockDeletePreset,
    });
  });

  it('renders a delete icon button', () => {
    render(<DeletePresetButton preset={mockPreset} />);

    const button = screen.getByRole('button', { name: /delete/i });
    expect(button).toBeInTheDocument();

    const icon = screen.getByTestId('delete-icon');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('data-font-size', 'small');
  });

  it('opens a confirmation dialog when clicked', async () => {
    render(<DeletePresetButton preset={mockPreset} />);

    // Dialog should not be visible initially
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Click the delete button
    await userEvent.click(screen.getByRole('button', { name: /delete/i }));

    // Dialog should be visible now
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Delete Preset')).toBeInTheDocument();
    expect(
      screen.getByText('Are you sure you want to delete this preset? This action cannot be undone.'),
    ).toBeInTheDocument();

    // Both buttons should be present
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  it('calls deletePreset with correct preset ID when Delete is clicked', async () => {
    render(<DeletePresetButton preset={mockPreset} />);

    // Open the dialog
    await userEvent.click(screen.getByRole('button', { name: /delete/i }));

    // Click the Delete button
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));

    // Check that deletePreset was called with the correct ID
    expect(mockDeletePreset).toHaveBeenCalledTimes(1);
    expect(mockDeletePreset).toHaveBeenCalledWith(123);

    // Dialog should be closed
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('closes the dialog without deleting when Cancel is clicked', async () => {
    render(<DeletePresetButton preset={mockPreset} />);

    // Open the dialog
    await userEvent.click(screen.getByRole('button', { name: /delete/i }));

    // Click the Cancel button
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    // deletePreset should not have been called
    expect(mockDeletePreset).not.toHaveBeenCalled();

    // Dialog should be closed
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('closes the dialog when clicking outside', async () => {
    render(<DeletePresetButton preset={mockPreset} />);

    // Open the dialog
    await userEvent.click(screen.getByRole('button', { name: /delete/i }));

    // Click outside the dialog (the backdrop)
    await userEvent.click(document.querySelector('.MuiBackdrop-root')!);

    // deletePreset should not have been called
    expect(mockDeletePreset).not.toHaveBeenCalled();

    // Dialog should be closed
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('stops event propagation when delete button is clicked', () => {
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
        <DeletePresetButton preset={mockPreset} />
      </div>,
    );

    // Use a more specific selector to get the delete button inside the component
    const deleteButton = screen.getByTestId('delete-icon').closest('button');
    expect(deleteButton).not.toBeNull();

    // Click the delete button
    fireEvent.click(deleteButton!);

    // The parent click handler should not have been called
    expect(parentClickHandler).not.toHaveBeenCalled();

    // The dialog should be open
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
