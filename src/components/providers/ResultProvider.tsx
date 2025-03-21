'use client';

import React, {
  createContext, useState, PropsWithChildren, useMemo,
} from 'react';
import { BoreResult } from '@/types/algorithm';

type ResultContextType = {
  result: BoreResult | null;
  setResult: (result: BoreResult | null) => void;
};

export const ResultContext = createContext<ResultContextType | undefined>(undefined);

export function ResultProvider({ children }: PropsWithChildren) {
  const [result, setResult] = useState<BoreResult | null>(null);

  const contextValue = useMemo(() => ({ result, setResult }), [result, setResult]);

  return <ResultContext.Provider value={contextValue}>{children}</ResultContext.Provider>;
}
