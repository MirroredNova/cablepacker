import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AddCableButton from '@/components/pages/home/header/AddCableButton';
import useTable from '@/hooks/useTable';
import useResult from '@/hooks/useResult';

// Mock the hooks
vi.mock('@/hooks/useTable', () => ({
  default: vi.fn(),
}));

vi.mock('@/hooks/useResult', () => ({
  default: vi.fn(),
}));

// Mock the AddIcon component
vi.mock('@mui/icons-material/Add', () => ({
  default: () => <span data-testid="add-icon">Add Icon</span>,
}));

describe('AddCableButton', () => {
  // Mock function for addRow
  const mockAddRow = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementation
    (useTable as any).mockReturnValue({
      addRow: mockAddRow,
    });

    (useResult as any).mockReturnValue({
      error: null,
      loading: false,
    });
  });

  it('renders a button with "Add Cable" text', () => {
    render(<AddCableButton />);

    const button = screen.getByRole('button', { name: /add cable/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Add Cable');
  });

  it('renders the add icon', () => {
    render(<AddCableButton />);

    const addIcon = screen.getByTestId('add-icon');
    expect(addIcon).toBeInTheDocument();
  });

  it('calls addRow when clicked', () => {
    render(<AddCableButton />);

    const button = screen.getByRole('button', { name: /add cable/i });
    fireEvent.click(button);

    expect(mockAddRow).toHaveBeenCalledTimes(1);
  });

  it('is disabled when loading is true', () => {
    // Override the default mock to return loading as true
    (useResult as any).mockReturnValue({
      error: null,
      loading: true,
    });

    render(<AddCableButton />);

    const button = screen.getByRole('button', { name: /add cable/i });
    expect(button).toBeDisabled();
  });

  it('is enabled when loading is false', () => {
    (useResult as any).mockReturnValue({
      error: null,
      loading: false,
    });

    render(<AddCableButton />);

    const button = screen.getByRole('button', { name: /add cable/i });
    expect(button).not.toBeDisabled();
  });

  it('has outlined variant', () => {
    render(<AddCableButton />);

    const button = screen.getByRole('button', { name: /add cable/i });
    expect(button).toHaveClass('MuiButton-outlined');
  });
});
