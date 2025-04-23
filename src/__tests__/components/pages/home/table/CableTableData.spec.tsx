import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CableTableData from '@/components/pages/home/table/CableTableData';
import useTable from '@/hooks/useTable';

// Mock the hooks and child components
vi.mock('@/hooks/useTable', () => ({
  default: vi.fn(),
}));

vi.mock('@/components/pages/home/table/CableTableRow', () => ({
  default: ({ row }: { row: any }) => (
    <tr data-testid="cable-table-row" data-row-id={row.id}>
      <td>
        Mocked Row:
        {' '}
        {row.name}
      </td>
    </tr>
  ),
}));

describe('CableTableData', () => {
  it('should render empty state message when tableData is empty', () => {
    // Mock useTable to return empty tableData
    (useTable as any).mockReturnValue({
      tableData: [],
    });

    render(<CableTableData />);

    // Check for the empty state message
    const emptyMessage = screen.getByText('No cables added. Click "Add Cable" to begin.');
    expect(emptyMessage).toBeInTheDocument();

    // Should be inside a TableCell that spans 4 columns
    const tableCell = emptyMessage.closest('td');
    expect(tableCell).toHaveAttribute('colspan', '4');
  });

  it('should render CableTableRow components for each data item', () => {
    // Mock sample table data
    const mockTableData = [
      { id: '1', name: 'Cable 1', diameter: 0.5, quantity: 2 },
      { id: '2', name: 'Cable 2', diameter: 0.75, quantity: 3 },
      { id: '3', name: 'Cable 3', diameter: 1.0, quantity: 1 },
    ];

    // Mock useTable to return the sample data
    (useTable as any).mockReturnValue({
      tableData: mockTableData,
    });

    render(<CableTableData />);

    // Should not show the empty message
    expect(screen.queryByText('No cables added. Click "Add Cable" to begin.')).not.toBeInTheDocument();

    // Should render a CableTableRow for each data item
    const rows = screen.getAllByTestId('cable-table-row');
    expect(rows).toHaveLength(3);

    // Check that each row has the correct data
    expect(rows[0]).toHaveAttribute('data-row-id', '1');
    expect(rows[1]).toHaveAttribute('data-row-id', '2');
    expect(rows[2]).toHaveAttribute('data-row-id', '3');

    // Check content of each row (from our mock implementation)
    expect(rows[0]).toHaveTextContent('Mocked Row: Cable 1');
    expect(rows[1]).toHaveTextContent('Mocked Row: Cable 2');
    expect(rows[2]).toHaveTextContent('Mocked Row: Cable 3');
  });

  it('should render correctly with a single item', () => {
    // Mock a single table data item
    const mockTableData = [
      { id: 'single', name: 'Single Cable', diameter: 0.5, quantity: 1 },
    ];

    // Mock useTable to return single item
    (useTable as any).mockReturnValue({
      tableData: mockTableData,
    });

    render(<CableTableData />);

    // Should render exactly one CableTableRow
    const rows = screen.getAllByTestId('cable-table-row');
    expect(rows).toHaveLength(1);
    expect(rows[0]).toHaveAttribute('data-row-id', 'single');
    expect(rows[0]).toHaveTextContent('Mocked Row: Single Cable');
  });

  it('should handle updating when table data changes', () => {
    // First render with empty data
    (useTable as any).mockReturnValue({
      tableData: [],
    });

    const { rerender } = render(<CableTableData />);

    // Should show empty message
    expect(screen.getByText('No cables added. Click "Add Cable" to begin.')).toBeInTheDocument();

    // Now update with some data
    const mockTableData = [
      { id: '1', name: 'Cable 1', diameter: 0.5, quantity: 2 },
      { id: '2', name: 'Cable 2', diameter: 0.75, quantity: 3 },
    ];

    (useTable as any).mockReturnValue({
      tableData: mockTableData,
    });

    // Re-render with new data
    rerender(<CableTableData />);

    // Empty message should be gone
    expect(screen.queryByText('No cables added. Click "Add Cable" to begin.')).not.toBeInTheDocument();

    // Should now have two rows
    const rows = screen.getAllByTestId('cable-table-row');
    expect(rows).toHaveLength(2);
  });
});
