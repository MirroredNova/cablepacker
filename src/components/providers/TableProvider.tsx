'use client';

import React, {
  useState, useMemo, PropsWithChildren, useCallback,
} from 'react';
import { nanoid } from 'nanoid';
import { TableError, TableRowData } from '@/types/table.types';
import { TableContext } from '@/context/TableContext';

export default function TableProvider({ children }: PropsWithChildren) {
  const [tableData, setTableData] = useState<TableRowData[]>([]);
  const [error, setError] = useState<TableError | null>(null);

  const resetTableData = useCallback(() => {
    setTableData([]);
  }, []);

  const addRow = () => {
    const newRow: TableRowData = {
      id: nanoid(),
      selectedCable: 'custom',
      customName: 'Custom',
      customDiameter: 1,
      quantity: 1,
    };
    setTableData((prev) => [
      ...prev, newRow,
    ]);
  };

  const updateRow = (id: string, updatedRow: Partial<TableRowData>) => {
    setTableData((prev) => prev.map((row) => (row.id === id ? { ...row, ...updatedRow } : row)));
  };

  const deleteRow = (id: string) => {
    setTableData((prev) => prev.filter((row) => row.id !== id));
  };

  const value = useMemo(
    () => ({
      tableData,
      error,
      setTableData,
      setError,
      addRow,
      updateRow,
      deleteRow,
      resetTableData,
    }),
    [tableData, error, resetTableData],
  );

  return <TableContext.Provider value={value}>{children}</TableContext.Provider>;
}
