import { useContext } from 'react';
import { TableContext } from '@/components/providers/TableProvider';

const useTableContext = () => {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error('useTableContext must be used within a TableProvider');
  }
  return context;
};

export default useTableContext;
