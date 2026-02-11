import { createContext } from 'react';
import { Result } from '@/types/domain.types';

export type ResultContextType = {
  result: Result | null;
  loading: boolean;
  error: string | null;
  resultId: string | null;
  setResult: (result: Result | null, navigate?: boolean | 'replace' | 'push') => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchResult: (id: string, navigate?: boolean | 'replace' | 'push') => Promise<boolean>;
  resetResult: () => void;
};

export const ResultContext = createContext<ResultContextType | null>(null);
