'use client';

import React, { useState, useMemo, PropsWithChildren, useCallback } from 'react';
import { nanoid } from 'nanoid';
import { TableError, TableRowData } from '@/types/table.types';
import { TableContext } from '@/context/TableContext';

export default function TableProvider({ children }: PropsWithChildren) {
  const [tableData, setTableData] = useState<TableRowData[]>([]);
  const [error, setError] = useState<TableError | null>(null);
  const [hasChangedSinceGeneration, setHasChangedSinceGeneration] = useState(false);

  // Reset table data
  const resetTableData = useCallback(() => {
    setTableData([]);
    setHasChangedSinceGeneration(false);
  }, []);

  // Add a new row
  const addRow = useCallback(() => {
    const newRow: TableRowData = {
      id: nanoid(),
      selectedCable: 'custom',
      customName: 'Custom',
      customDiameter: 1,
      quantity: 1,
    };
    setTableData((prev) => [...prev, newRow]);
    setHasChangedSinceGeneration(true);
  }, []);

  // Update an existing row
  const updateRow = useCallback((id: string, updatedRow: Partial<TableRowData>) => {
    setTableData((prev) => prev.map((row) => (row.id === id ? { ...row, ...updatedRow } : row)));
    setHasChangedSinceGeneration(true);
  }, []);

  // Delete a row
  const deleteRow = useCallback((id: string) => {
    setTableData((prev) => prev.filter((row) => row.id !== id));
    setHasChangedSinceGeneration(true);
  }, []);

  const value = useMemo(
    () => ({
      tableData,
      error,
      hasChangedSinceGeneration,
      setTableData,
      setError,
      setHasChangedSinceGeneration,
      addRow,
      updateRow,
      deleteRow,
      resetTableData,
    }),
    [tableData, error, hasChangedSinceGeneration, addRow, updateRow, deleteRow, resetTableData],
  );

  return <TableContext.Provider value={value}>{children}</TableContext.Provider>;
}
