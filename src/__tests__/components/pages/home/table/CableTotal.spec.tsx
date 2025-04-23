import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CableTotal from '@/components/pages/home/table/CableTotal';
import useTable from '@/hooks/useTable';

// Mock hooks and dependencies
vi.mock('@/hooks/useTable', () => ({
  default: vi.fn(),
}));

vi.mock('@/config', () => ({
  clientConfig: {
    MAX_CIRCLES: 50, // Use a value for testing calculations
  },
}));

// Mock MUI components for easier testing
vi.mock('@mui/material/CircularProgress', () => ({
  default: ({ value, sx, ...props }: any) => (
    <div
      data-testid="circular-progress"
      data-value={value}
      data-color={sx?.color}
      {...props}
    >
      Progress:
      {' '}
      {value}
      %
    </div>
  ),
}));

describe('CableTotal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with zero cables when tableData is empty', () => {
    // Mock useTable to return empty tableData
    (useTable as any).mockReturnValue({
      tableData: [],
    });

    render(<CableTotal />);

    // Check progress indicator
    const progress = screen.getByTestId('circular-progress');
    expect(progress).toHaveAttribute('data-value', '0');
    expect(progress).toHaveAttribute('data-color', 'action.disabled');

    // Check total text
    const totalText = screen.getByText('0');
    expect(totalText).toBeInTheDocument();
    expect(screen.getByText('Total Cables')).toBeInTheDocument();
  });

  it('calculates and displays the correct total from tableData', () => {
    // Mock useTable with sample data
    const mockTableData = [
      { id: '1', quantity: 3 },
      { id: '2', quantity: 5 },
      { id: '3', quantity: 2 },
    ];

    (useTable as any).mockReturnValue({
      tableData: mockTableData,
    });

    render(<CableTotal />);

    // Total should be sum of quantities: 3 + 5 + 2 = 10
    const totalText = screen.getByText('10');
    expect(totalText).toBeInTheDocument();
  });

  it('handles null or undefined quantity values correctly', () => {
    // Mock useTable with data including undefined/null quantities
    const mockTableData = [
      { id: '1', quantity: 3 },
      { id: '2', quantity: null },
      { id: '3', quantity: undefined },
      { id: '4', quantity: 5 },
    ];

    (useTable as any).mockReturnValue({
      tableData: mockTableData,
    });

    render(<CableTotal />);

    // Should only count valid quantities: 3 + 0 + 0 + 5 = 8
    const totalText = screen.getByText('8');
    expect(totalText).toBeInTheDocument();
  });

  it('calculates the correct fill percentage', () => {
    // Mock useTable with data
    const mockTableData = [
      { id: '1', quantity: 10 },
    ];

    (useTable as any).mockReturnValue({
      tableData: mockTableData,
    });

    render(<CableTotal />);

    // Expected percentage: (10/50) * 100 = 20%
    const progress = screen.getByTestId('circular-progress');
    expect(progress).toHaveAttribute('data-value', '20');
  });

  it('caps fill percentage at 100% for large totals', () => {
    // Mock useTable with data exceeding MAX_CIRCLES
    const mockTableData = [
      { id: '1', quantity: 60 }, // More than MAX_CIRCLES (50)
    ];

    (useTable as any).mockReturnValue({
      tableData: mockTableData,
    });

    render(<CableTotal />);

    // Should cap at 100% even though actual would be 120%
    const progress = screen.getByTestId('circular-progress');
    expect(progress).toHaveAttribute('data-value', '100');

    // Should still show the actual total
    const totalText = screen.getByText('60');
    expect(totalText).toBeInTheDocument();
  });

  it('uses primary color for progress when cables exist', () => {
    // Mock useTable with some data
    const mockTableData = [
      { id: '1', quantity: 5 },
    ];

    (useTable as any).mockReturnValue({
      tableData: mockTableData,
    });

    render(<CableTotal />);

    // Should use primary color when cables > 0
    const progress = screen.getByTestId('circular-progress');
    expect(progress).toHaveAttribute('data-color', 'primary.main');
  });

  it('uses disabled color for progress when no cables exist', () => {
    // Mock useTable with empty data
    (useTable as any).mockReturnValue({
      tableData: [],
    });

    render(<CableTotal />);

    // Should use disabled color when cables = 0
    const progress = screen.getByTestId('circular-progress');
    expect(progress).toHaveAttribute('data-color', 'action.disabled');
  });
});
