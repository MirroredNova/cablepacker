import { useContext } from 'react';
import { TableContext } from '@/context/TableContext';

export default function useTable() {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error('useTableContext must be used within a TableProvider');
  }
  return context;
}
