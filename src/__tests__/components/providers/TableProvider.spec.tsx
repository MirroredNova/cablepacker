import React, { useContext } from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TableProvider from '@/components/providers/TableProvider';
import { TableContext } from '@/context/TableContext';

// Mock nanoid to return predictable IDs for testing
vi.mock('nanoid', () => ({
  nanoid: vi.fn(() => 'test-id-123'),
}));

// Test component that consumes the TableContext
function TestComponent() {
  const context = useContext(TableContext);

  if (!context) {
    throw new Error('TableContext must be used within a TableProvider');
  }

  const {
    tableData,
    error,
    hasChangedSinceGeneration,
    addRow,
    updateRow,
    deleteRow,
    resetTableData,
    setError,
    setTableData,
  } = context;

  return (
    <div>
      <div data-testid="table-data">{JSON.stringify(tableData)}</div>
      <div data-testid="error">{error ? JSON.stringify(error) : 'null'}</div>
      <div data-testid="has-changed">{hasChangedSinceGeneration.toString()}</div>

      <button data-testid="add-row" type="button" onClick={addRow}>
        Add Row
      </button>

      <button
        type="button"
        data-testid="update-row"
        onClick={() => updateRow('test-id-123', { customName: 'Updated', quantity: 2 })}
      >
        Update Row
      </button>

      <button type="button" data-testid="delete-row" onClick={() => deleteRow('test-id-123')}>
        Delete Row
      </button>

      <button data-testid="reset-table" type="button" onClick={resetTableData}>
        Reset Table
      </button>

      <button
        data-testid="set-error"
        type="button"
        onClick={() => setError({ message: 'Test error', code: 400, timeout: 5000 })}
      >
        Set Error
      </button>

      <button
        data-testid="set-table-data"
        type="button"
        onClick={() => setTableData([
          {
            id: 'test-id-456',
            selectedCable: 'custom',
            customName: 'Test Cable',
            customDiameter: 2,
            quantity: 3,
          },
        ])}
      >
        Set Table Data
      </button>
    </div>
  );
}

describe('TableProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children without crashing', () => {
    render(
      <TableProvider>
        <div data-testid="child-element">Child Content</div>
      </TableProvider>,
    );

    expect(screen.getByTestId('child-element')).toBeInTheDocument();
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('provides initial context with empty table data and no errors', () => {
    render(
      <TableProvider>
        <TestComponent />
      </TableProvider>,
    );

    expect(screen.getByTestId('table-data')).toHaveTextContent('[]');
    expect(screen.getByTestId('error')).toHaveTextContent('null');
    expect(screen.getByTestId('has-changed')).toHaveTextContent('false');
  });

  it('adds a new row with correct default values', () => {
    render(
      <TableProvider>
        <TestComponent />
      </TableProvider>,
    );

    act(() => {
      screen.getByTestId('add-row').click();
    });

    const expectedRow = {
      id: 'test-id-123',
      selectedCable: 'custom',
      customName: 'Custom',
      customDiameter: 1,
      quantity: 1,
    };

    expect(screen.getByTestId('table-data')).toHaveTextContent(JSON.stringify([expectedRow]));
    expect(screen.getByTestId('has-changed')).toHaveTextContent('true');
  });

  it('updates an existing row correctly', () => {
    render(
      <TableProvider>
        <TestComponent />
      </TableProvider>,
    );

    // First add a row
    act(() => {
      screen.getByTestId('add-row').click();
    });

    // Then update it
    act(() => {
      screen.getByTestId('update-row').click();
    });

    const expectedUpdatedRow = {
      id: 'test-id-123',
      selectedCable: 'custom',
      customName: 'Updated', // Changed
      customDiameter: 1,
      quantity: 2, // Changed
    };

    expect(screen.getByTestId('table-data')).toHaveTextContent(JSON.stringify([expectedUpdatedRow]));
    expect(screen.getByTestId('has-changed')).toHaveTextContent('true');
  });

  it('deletes a row correctly', () => {
    render(
      <TableProvider>
        <TestComponent />
      </TableProvider>,
    );

    // First add a row
    act(() => {
      screen.getByTestId('add-row').click();
    });

    // Then delete it
    act(() => {
      screen.getByTestId('delete-row').click();
    });

    expect(screen.getByTestId('table-data')).toHaveTextContent('[]');
    expect(screen.getByTestId('has-changed')).toHaveTextContent('true');
  });

  it('resets table data correctly', () => {
    render(
      <TableProvider>
        <TestComponent />
      </TableProvider>,
    );

    // Add a row
    act(() => {
      screen.getByTestId('add-row').click();
    });

    // Then reset the table
    act(() => {
      screen.getByTestId('reset-table').click();
    });

    expect(screen.getByTestId('table-data')).toHaveTextContent('[]');
    expect(screen.getByTestId('has-changed')).toHaveTextContent('false');
  });

  it('sets error correctly', () => {
    render(
      <TableProvider>
        <TestComponent />
      </TableProvider>,
    );

    act(() => {
      screen.getByTestId('set-error').click();
    });

    const expectedError = { message: 'Test error', code: 400, timeout: 5000 };
    expect(screen.getByTestId('error')).toHaveTextContent(JSON.stringify(expectedError));
  });

  it('sets table data directly', () => {
    render(
      <TableProvider>
        <TestComponent />
      </TableProvider>,
    );

    act(() => {
      screen.getByTestId('set-table-data').click();
    });

    const expectedData = [
      {
        id: 'test-id-456',
        selectedCable: 'custom',
        customName: 'Test Cable',
        customDiameter: 2,
        quantity: 3,
      },
    ];

    expect(screen.getByTestId('table-data')).toHaveTextContent(JSON.stringify(expectedData));
  });

  it('handles multiple row operations in sequence', () => {
    render(
      <TableProvider>
        <TestComponent />
      </TableProvider>,
    );

    // Add first row
    act(() => {
      screen.getByTestId('add-row').click();
    });

    // Add second row (will have same ID due to mocked nanoid)
    act(() => {
      screen.getByTestId('add-row').click();
    });

    // Only the last row should remain since IDs are the same (due to our mock)
    const expectedData = [
      {
        id: 'test-id-123',
        selectedCable: 'custom',
        customName: 'Custom',
        customDiameter: 1,
        quantity: 1,
      },
      {
        id: 'test-id-123',
        selectedCable: 'custom',
        customName: 'Custom',
        customDiameter: 1,
        quantity: 1,
      },
    ];

    expect(screen.getByTestId('table-data')).toHaveTextContent(JSON.stringify(expectedData));

    // Now let's set custom table data with a different ID
    act(() => {
      screen.getByTestId('set-table-data').click();
    });

    const newExpectedData = [
      {
        id: 'test-id-456',
        selectedCable: 'custom',
        customName: 'Test Cable',
        customDiameter: 2,
        quantity: 3,
      },
    ];

    expect(screen.getByTestId('table-data')).toHaveTextContent(JSON.stringify(newExpectedData));

    // Update this new row (which won't actually update since ID doesn't match)
    act(() => {
      screen.getByTestId('update-row').click();
    });

    // The data should remain unchanged because the update targets a different ID
    expect(screen.getByTestId('table-data')).toHaveTextContent(JSON.stringify(newExpectedData));
  });

  it('provides context with the expected shape', () => {
    let contextValue: any;

    function ContextInspector() {
      contextValue = useContext(TableContext);
      return null;
    }

    render(
      <TableProvider>
        <ContextInspector />
      </TableProvider>,
    );

    // Check all expected properties exist
    expect(contextValue).toHaveProperty('tableData');
    expect(contextValue).toHaveProperty('error');
    expect(contextValue).toHaveProperty('hasChangedSinceGeneration');
    expect(contextValue).toHaveProperty('setTableData');
    expect(contextValue).toHaveProperty('setError');
    expect(contextValue).toHaveProperty('setHasChangedSinceGeneration');
    expect(contextValue).toHaveProperty('addRow');
    expect(contextValue).toHaveProperty('updateRow');
    expect(contextValue).toHaveProperty('deleteRow');
    expect(contextValue).toHaveProperty('resetTableData');

    // Check types
    expect(Array.isArray(contextValue.tableData)).toBe(true);
    expect(typeof contextValue.setTableData).toBe('function');
    expect(typeof contextValue.addRow).toBe('function');
    expect(typeof contextValue.updateRow).toBe('function');
    expect(typeof contextValue.deleteRow).toBe('function');
    expect(typeof contextValue.resetTableData).toBe('function');
  });
});
