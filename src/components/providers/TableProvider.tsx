'use client';

import React, {
  useState, useMemo, createContext, PropsWithChildren,
} from 'react';
import { v4 as uuidv4 } from 'uuid'; // Using UUID for better IDs
import { TableError, TableRowData } from '@/types/table';

type TableContextType = {
  tableData: TableRowData[];
  error: TableError | null;
  setError: (error: TableError | null) => void;
  addRow: () => void;
  updateRow: (id: string, updatedRow: Partial<TableRowData>) => void;
  deleteRow: (id: string) => void;
};

export const TableContext = createContext<TableContextType | null>(null);

export default function TableProvider({ children }: PropsWithChildren) {
  const [tableData, setTableData] = useState<TableRowData[]>([]);
  const [error, setError] = useState<TableError | null>(null);

  const addRow = () => {
    setTableData((prev) => [
      ...prev,
      {
        id: uuidv4(),
        selectedCable: 'custom',
        customName: 'Custom',
        customDiameter: 1,
        quantity: 1,
      },
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
      setError,
      addRow,
      updateRow,
      deleteRow,
    }),
    [tableData, error],
  );

  return <TableContext.Provider value={value}>{children}</TableContext.Provider>;
}
