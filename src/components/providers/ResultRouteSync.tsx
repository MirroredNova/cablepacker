'use client';

import { useParams, usePathname } from 'next/navigation';
import { useEffect, useLayoutEffect, useRef } from 'react';
import useResult from '@/hooks/useResult';

function ResultRouteSync() {
  const {
    result, loading, setResult, fetchResult, resetResult,
  } = useResult();
  const params = useParams<{ resultId?: string }>();
  const pathname = usePathname();
  const resultId = params?.resultId || null;

  const fetchResultRef = useRef(fetchResult);
  const resetResultRef = useRef(resetResult);
  const previousResultIdRef = useRef<string | null>(resultId);

  useEffect(() => {
    fetchResultRef.current = fetchResult;
  }, [fetchResult]);

  useEffect(() => {
    resetResultRef.current = resetResult;
  }, [resetResult]);

  useLayoutEffect(() => {
    const routeChanged = previousResultIdRef.current !== resultId;
    previousResultIdRef.current = resultId;

    if (resultId && result?.id === resultId) return;

    if (resultId) {
      if (loading) return;
      // If route id did not change but result did, we are likely between setResult(..., navigate=true)
      // and Next.js params update; skip to avoid refetching the old route id.
      if (!routeChanged && result) return;
      if (result) {
        setResult(null);
      }
      fetchResultRef.current(resultId);
      return;
    }

    // Only reset when we actually navigated from a result route back to home.
    // Prevents clearing table state during in-place URL updates from home -> /:id.
    if (pathname === '/' && routeChanged) {
      resetResultRef.current();
    }
  }, [loading, pathname, result, resultId, setResult]);

  return null;
}

export default ResultRouteSync;
