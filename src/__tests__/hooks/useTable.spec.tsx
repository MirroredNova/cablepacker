import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import useTable from '@/hooks/useTable';
import { TableContext, TableContextType } from '@/context/TableContext';
import { TableRowData, TableError } from '@/types/table.types';

describe('useTable', () => {
  // Sample table data for testing
  const mockTableData: TableRowData[] = [
    {
      id: 'row-1',
      selectedCable: 'custom',
      customName: 'Cable 1',
      customDiameter: 0.5,
      quantity: 3,
    },
    {
      id: 'row-2',
      selectedCable: { id: 1, name: 'Preset Cable', diameter: 0.75 } as any,
      quantity: 2,
    },
  ];

  // Mock error object
  const mockError: TableError = {
    message: 'Test error message',
  };

  // Mock context functions
  const mockSetTableData = vi.fn();
  const mockSetError = vi.fn();
  const mockSetHasChangedSinceGeneration = vi.fn();
  const mockAddRow = vi.fn();
  const mockUpdateRow = vi.fn();
  const mockDeleteRow = vi.fn();
  const mockResetTableData = vi.fn();

  // Mock table context value
  let mockTableValue: TableContextType;

  beforeEach(() => {
    // Reset all mock functions
    vi.clearAllMocks();

    // Create a fresh context value for each test
    mockTableValue = {
      tableData: mockTableData,
      error: null,
      hasChangedSinceGeneration: false,
      setTableData: mockSetTableData,
      setError: mockSetError,
      setHasChangedSinceGeneration: mockSetHasChangedSinceGeneration,
      addRow: mockAddRow,
      updateRow: mockUpdateRow,
      deleteRow: mockDeleteRow,
      resetTableData: mockResetTableData,
    };
  });

  it('returns the context value when used within TableContext provider', () => {
    // Wrapper component that provides the table context
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <TableContext.Provider value={mockTableValue}>{children}</TableContext.Provider>
    );

    // Render the hook within the context provider
    const { result } = renderHook(() => useTable(), { wrapper });

    // Verify that the hook returns the provided context value
    expect(result.current).toEqual(mockTableValue);
    expect(result.current.tableData).toEqual(mockTableData);
    expect(result.current.error).toBeNull();
    expect(result.current.hasChangedSinceGeneration).toBe(false);

    // Verify that all functions are available
    expect(result.current.setTableData).toBe(mockSetTableData);
    expect(result.current.setError).toBe(mockSetError);
    expect(result.current.setHasChangedSinceGeneration).toBe(mockSetHasChangedSinceGeneration);
    expect(result.current.addRow).toBe(mockAddRow);
    expect(result.current.updateRow).toBe(mockUpdateRow);
    expect(result.current.deleteRow).toBe(mockDeleteRow);
    expect(result.current.resetTableData).toBe(mockResetTableData);
  });

  it('throws an error when used outside of TableContext provider', () => {
    // Use console.error spy to suppress the expected error in test output
    const consoleErrorSpy = vi.spyOn(console, 'error');
    consoleErrorSpy.mockImplementation(() => {});

    // Attempt to render the hook without a context provider
    expect(() => {
      renderHook(() => useTable());
    }).toThrow('useTableContext must be used within a TableProvider');

    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  it('handles table data modifications', () => {
    // Create a wrapper with stateful context
    function TestWrapper({ children }: { children: React.ReactNode }) {
      const [tableData, setTableDataState] = React.useState<TableRowData[]>(mockTableData);

      const contextValue: TableContextType = React.useMemo(
        () => ({
          ...mockTableValue,
          tableData,
          setTableData: (newData) => {
            if (typeof newData === 'function') {
              setTableDataState(newData(tableData));
            } else {
              setTableDataState(newData);
            }
            mockSetTableData(newData);
          },
          updateRow: (id, updates) => {
            setTableDataState((prevData) => prevData.map((row) => (row.id === id ? { ...row, ...updates } : row)));
            mockUpdateRow(id, updates);
          },
          deleteRow: (id) => {
            setTableDataState((prevData) => prevData.filter((row) => row.id !== id));
            mockDeleteRow(id);
          },
          addRow: () => {
            const newRow: TableRowData = {
              id: 'new-row',
              selectedCable: 'custom',
              customName: 'New Cable',
              customDiameter: 0.25,
              quantity: 1,
            };
            setTableDataState((prevData) => [...prevData, newRow]);
            mockAddRow();
          },
          resetTableData: () => {
            setTableDataState([]);
            mockResetTableData();
          },
        }),
        [tableData],
      );

      return <TableContext.Provider value={contextValue}>{children}</TableContext.Provider>;
    }

    // Render the hook with the stateful wrapper
    const { result } = renderHook(() => useTable(), { wrapper: TestWrapper });

    // Initial table data
    expect(result.current.tableData).toEqual(mockTableData);
    expect(result.current.tableData.length).toBe(2);

    // Test updateRow
    act(() => {
      result.current.updateRow('row-1', { customName: 'Updated Cable', quantity: 5 });
    });

    // Verify row was updated
    expect(result.current.tableData[0].customName).toBe('Updated Cable');
    expect(result.current.tableData[0].quantity).toBe(5);
    expect(mockUpdateRow).toHaveBeenCalledWith('row-1', {
      customName: 'Updated Cable',
      quantity: 5,
    });

    // Test deleteRow
    act(() => {
      result.current.deleteRow('row-2');
    });

    // Verify row was deleted
    expect(result.current.tableData.length).toBe(1);
    expect(result.current.tableData.find((row) => row.id === 'row-2')).toBeUndefined();
    expect(mockDeleteRow).toHaveBeenCalledWith('row-2');

    // Test addRow
    act(() => {
      result.current.addRow();
    });

    // Verify row was added
    expect(result.current.tableData.length).toBe(2);
    expect(result.current.tableData[1].id).toBe('new-row');
    expect(mockAddRow).toHaveBeenCalled();

    // Test resetTableData
    act(() => {
      result.current.resetTableData();
    });

    // Verify table was reset
    expect(result.current.tableData).toEqual([]);
    expect(result.current.tableData.length).toBe(0);
    expect(mockResetTableData).toHaveBeenCalled();
  });

  it('handles error state', () => {
    // Create a wrapper with error state
    function TestWrapper({ children }: { children: React.ReactNode }) {
      const [error, setErrorState] = React.useState<TableError | null>(null);

      const contextValue: TableContextType = React.useMemo(
        () => ({
          ...mockTableValue,
          error,
          setError: (newError) => {
            setErrorState(newError);
            mockSetError(newError);
          },
        }),
        [error],
      );

      return <TableContext.Provider value={contextValue}>{children}</TableContext.Provider>;
    }

    // Render the hook with the error state wrapper
    const { result } = renderHook(() => useTable(), { wrapper: TestWrapper });

    // Initially no error
    expect(result.current.error).toBeNull();

    // Set an error
    act(() => {
      result.current.setError(mockError);
    });

    // Verify error was set
    expect(result.current.error).toEqual(mockError);
    expect(result.current.error?.message).toBe('Test error message');
    expect(mockSetError).toHaveBeenCalledWith(mockError);

    // Clear the error
    act(() => {
      result.current.setError(null);
    });

    // Verify error was cleared
    expect(result.current.error).toBeNull();
    expect(mockSetError).toHaveBeenCalledWith(null);
  });

  it('handles hasChangedSinceGeneration state', () => {
    // Create a wrapper with generation state
    function TestWrapper({ children }: { children: React.ReactNode }) {
      const [hasChanged, setHasChanged] = React.useState<boolean>(false);

      const contextValue: TableContextType = React.useMemo(
        () => ({
          ...mockTableValue,
          hasChangedSinceGeneration: hasChanged,
          setHasChangedSinceGeneration: (newValue) => {
            if (typeof newValue === 'function') {
              setHasChanged(newValue(hasChanged));
            } else {
              setHasChanged(newValue);
            }
            mockSetHasChangedSinceGeneration(newValue);
          },
        }),
        [hasChanged],
      );

      return <TableContext.Provider value={contextValue}>{children}</TableContext.Provider>;
    }

    // Render the hook with the state wrapper
    const { result } = renderHook(() => useTable(), { wrapper: TestWrapper });

    // Initially false
    expect(result.current.hasChangedSinceGeneration).toBe(false);

    // Set to true
    act(() => {
      result.current.setHasChangedSinceGeneration(true);
    });

    // Verify state was updated
    expect(result.current.hasChangedSinceGeneration).toBe(true);
    expect(mockSetHasChangedSinceGeneration).toHaveBeenCalledWith(true);

    // Use function updater
    act(() => {
      result.current.setHasChangedSinceGeneration((prev) => !prev);
    });

    // Verify state was toggled
    expect(result.current.hasChangedSinceGeneration).toBe(false);
    // Can't directly check the function passed to mockSetHasChangedSinceGeneration
    expect(mockSetHasChangedSinceGeneration).toHaveBeenCalled();
  });

  it('handles direct table data updates', () => {
    // Create a wrapper with stateful context
    function TestWrapper({ children }: { children: React.ReactNode }) {
      const [tableData, setTableDataState] = React.useState<TableRowData[]>(mockTableData);

      const contextValue: TableContextType = React.useMemo(
        () => ({
          ...mockTableValue,
          tableData,
          setTableData: (newData) => {
            if (typeof newData === 'function') {
              setTableDataState(newData(tableData));
            } else {
              setTableDataState(newData);
            }
            mockSetTableData(newData);
          },
        }),
        [tableData],
      );

      return <TableContext.Provider value={contextValue}>{children}</TableContext.Provider>;
    }

    // Render the hook with the stateful wrapper
    const { result } = renderHook(() => useTable(), { wrapper: TestWrapper });

    // Initial table data
    expect(result.current.tableData).toEqual(mockTableData);

    // New table data for testing
    const newTableData: TableRowData[] = [
      {
        id: 'row-3',
        selectedCable: 'custom',
        customName: 'Brand New Cable',
        customDiameter: 1.0,
        quantity: 10,
      },
    ];

    // Set completely new data
    act(() => {
      result.current.setTableData(newTableData);
    });

    // Verify data was completely replaced
    expect(result.current.tableData).toEqual(newTableData);
    expect(result.current.tableData.length).toBe(1);
    expect(result.current.tableData[0].id).toBe('row-3');
    expect(mockSetTableData).toHaveBeenCalledWith(newTableData);

    // Test with function updater
    act(() => {
      result.current.setTableData((prev) => [
        ...prev,
        {
          id: 'row-4',
          selectedCable: 'custom',
          customName: 'Another Cable',
          customDiameter: 0.75,
          quantity: 5,
        },
      ]);
    });

    // Verify data was updated with function
    expect(result.current.tableData.length).toBe(2);
    expect(result.current.tableData[1].id).toBe('row-4');
    expect(mockSetTableData).toHaveBeenCalled();
  });
});
