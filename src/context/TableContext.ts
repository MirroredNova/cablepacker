import { createContext } from 'react';
import { TableError, TableRowData } from '@/types/table.types';

export type TableContextType = {
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
