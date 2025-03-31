'use client';

import React, {
  useState, useMemo, createContext, PropsWithChildren, useCallback,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import { TableError, TableRowData } from '@/types/table.types';

type TableContextType = {
  tableData: TableRowData[];
  error: TableError | null;
  setTableData: React.Dispatch<React.SetStateAction<TableRowData[]>>;
  setError: (error: TableError | null) => void;
  addRow: () => void;
  updateRow: (id: string, updatedRow: Partial<TableRowData>) => void;
  deleteRow: (id: string) => void;
  resetTableData: () => void;
};

export const TableContext = createContext<TableContextType | null>(null);

export default function TableProvider({ children }: PropsWithChildren) {
  const [tableData, setTableData] = useState<TableRowData[]>([]);
  const [error, setError] = useState<TableError | null>(null);

  const resetTableData = useCallback(() => {
    setTableData([]);
  }, []);

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
