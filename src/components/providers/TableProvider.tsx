'use client';

import React, {
  useState, useMemo, createContext, PropsWithChildren,
} from 'react';
import { v4 as uuidv4 } from 'uuid'; // Using UUID for better IDs
import { TableRowData } from '@/types/table';

type TableContextType = {
  tableData: TableRowData[];
  addRow: () => void;
  updateRow: (id: string, updatedRow: Partial<TableRowData>) => void;
  deleteRow: (id: string) => void;
};

export const TableContext = createContext<TableContextType | null>(null);

export default function TableProvider({ children }: PropsWithChildren) {
  const [tableData, setTableData] = useState<TableRowData[]>([]);

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
      addRow,
      updateRow,
      deleteRow,
    }),
    [tableData],
  );

  return <TableContext.Provider value={value}>{children}</TableContext.Provider>;
}
