'use client';

import { useParams, usePathname } from 'next/navigation';
import React, {
  createContext, PropsWithChildren, useCallback, useEffect, useMemo, useState,
} from 'react';
import useTable from '@/hooks/useTable';
import { getResultByIdAction } from '@/server/actions/results.actions';
import { BoreResult } from '@/types/algorithm.types';
import { TableRowData } from '@/types/table.types';

type ResultContextType = {
  result: BoreResult | null;
  loading: boolean;
  error: string | null;
  resultId: string | null;
  setResult: (result: BoreResult | null) => void;
  fetchResult: (id: string) => Promise<boolean>;
  resetResult: () => void;
};

export const ResultContext = createContext<ResultContextType | undefined>(undefined);

export function ResultProvider({ children }: PropsWithChildren) {
  // State management
  const [result, setResult] = useState<BoreResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // External hooks
  const { setTableData, resetTableData } = useTable();
  const params = useParams<{ resultId?: string }>();
  const pathname = usePathname();
  const resultId = params?.resultId || null;

  // Reset both result and table data
  const resetResult = useCallback(() => {
    setResult(null);
    setError(null);
    resetTableData();
  }, [resetTableData]);

  // Fetch a result by ID
  const fetchResult = useCallback(async (id: string): Promise<boolean> => {
    if (!id?.trim()) return false;

    setLoading(true);

    try {
      const response = await getResultByIdAction(id.trim());

      if (response.success && response.result) {
        setResult(response.result.resultData as BoreResult);
        setTableData(response.result.inputCables as TableRowData[] || []);
        return true;
      }
      setError(response.error || 'Failed to load result');
      return false;
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  }, [setTableData]);

  // Auto-fetch on route change
  useEffect(() => {
    if (resultId) {
      fetchResult(resultId);
    } else if (pathname === '/') {
      resetResult();
    }
  }, [resultId, pathname, fetchResult, resetResult]);

  // Create context value
  const value = useMemo(() => ({
    result,
    loading,
    error,
    resultId,
    setResult,
    fetchResult,
    resetResult,
  }), [result, loading, error, resultId, fetchResult, resetResult]);

  return (
    <ResultContext.Provider value={value}>
      {children}
    </ResultContext.Provider>
  );
}
