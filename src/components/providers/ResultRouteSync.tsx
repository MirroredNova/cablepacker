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
  const attemptedResultIdRef = useRef<string | null>(null);

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
      if (routeChanged) {
        attemptedResultIdRef.current = null;
      }
      // If route id did not change but result did, we are likely between setResult(..., navigate=true)
      // and Next.js params update; skip to avoid refetching the old route id.
      if (!routeChanged && result) return;
      // Prevent infinite retries for a missing/failed result id while staying on the same route.
      if (attemptedResultIdRef.current === resultId) return;
      if (result) {
        setResult(null);
      }
      attemptedResultIdRef.current = resultId;
      fetchResultRef.current(resultId);
      return;
    }

    // Only reset when we actually navigated from a result route back to home.
    // Prevents clearing table state during in-place URL updates from home -> /:id.
    if (pathname === '/' && routeChanged) {
      attemptedResultIdRef.current = null;
      resetResultRef.current();
    }
  }, [loading, pathname, result, resultId, setResult]);

  return null;
}

export default ResultRouteSync;
