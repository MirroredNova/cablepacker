import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DeleteCableButton from '@/components/pages/admin/cables/DeleteCableButton';
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

// Mock MUI components
vi.mock('@mui/material/IconButton', () => ({
  default: ({
    children,
    onClick,
    'aria-label': ariaLabel,
    size,
  }: {
    children: React.ReactNode;
    onClick: () => void;
    'aria-label': string;
    size: string;
  }) => (
    <button type="button" onClick={onClick} aria-label={ariaLabel} data-size={size} data-testid="icon-button">
      {children}
    </button>
  ),
}));

vi.mock('@mui/icons-material/Delete', () => ({
  default: ({ fontSize }: { fontSize?: string }) => (
    <span data-testid="delete-icon" data-font-size={fontSize}>
      Delete Icon
    </span>
  ),
}));

describe('DeleteCableButton', () => {
  // Sample data for testing
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

  // Mock function to test the delete action
  const mockDeleteCableFromPreset = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock hook returns
    (useAdmin as any).mockReturnValue({
      selectedPreset: mockPreset,
    });

    (usePreset as any).mockReturnValue({
      deleteCableFromPreset: mockDeleteCableFromPreset,
    });
  });

  it('renders a delete icon button', () => {
    render(<DeleteCableButton cable={mockCable} />);

    const iconButton = screen.getByTestId('icon-button');
    expect(iconButton).toBeInTheDocument();
    expect(iconButton).toHaveAttribute('aria-label', 'delete');
    expect(iconButton).toHaveAttribute('data-size', 'small');

    const deleteIcon = screen.getByTestId('delete-icon');
    expect(deleteIcon).toBeInTheDocument();
    expect(deleteIcon).toHaveAttribute('data-font-size', 'small');
  });

  it('calls deleteCableFromPreset with correct parameters when clicked', async () => {
    render(<DeleteCableButton cable={mockCable} />);

    // Click the delete button
    fireEvent.click(screen.getByTestId('icon-button'));

    // Check if the delete function was called with the correct parameters
    expect(mockDeleteCableFromPreset).toHaveBeenCalledTimes(1);
    expect(mockDeleteCableFromPreset).toHaveBeenCalledWith(mockPreset.id, mockCable.id);
  });

  it('does not call deleteCableFromPreset when no preset is selected', async () => {
    // Override the mock to return null for selectedPreset
    (useAdmin as any).mockReturnValue({
      selectedPreset: null,
    });

    render(<DeleteCableButton cable={mockCable} />);

    // Click the delete button
    fireEvent.click(screen.getByTestId('icon-button'));

    // Delete function should not be called
    expect(mockDeleteCableFromPreset).not.toHaveBeenCalled();
  });

  it('maintains the async behavior of the deletion function', async () => {
    // Mock a delayed resolution
    const asyncDeleteMock = vi.fn().mockImplementation(
      () => new Promise((resolve) => {
        setTimeout(() => resolve(true), 10);
      }),
    );

    (usePreset as any).mockReturnValue({
      deleteCableFromPreset: asyncDeleteMock,
    });

    render(<DeleteCableButton cable={mockCable} />);

    // Click the delete button
    fireEvent.click(screen.getByTestId('icon-button'));

    // Verify the async function was called
    expect(asyncDeleteMock).toHaveBeenCalledTimes(1);
    expect(asyncDeleteMock).toHaveBeenCalledWith(mockPreset.id, mockCable.id);
  });
});
