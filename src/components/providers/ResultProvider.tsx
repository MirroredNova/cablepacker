'use client';

import { useParams, usePathname } from 'next/navigation';
import React, { PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import usePreset from '@/hooks/usePreset';
import useTable from '@/hooks/useTable';
import { getResultByIdAction } from '@/server/actions/results.actions';
import { Result } from '@/types/domain.types';
import { ResultContext } from '@/context/ResultContext';

export function ResultProvider({ children }: PropsWithChildren) {
  const [result, setResultState] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const justSetResultRef = useRef(false);
  const pendingPresetIdRef = useRef<number | null>(null);
  const fetchResultRef = useRef<(id: string) => Promise<boolean>>(async () => false);
  const resetResultRef = useRef<() => void>(() => {});

  const { presets, setSelectedPreset, resetPresets, presetsLoaded } = usePreset();
  const { setTableData, resetTableData, setHasChangedSinceGeneration } = useTable();

  const params = useParams<{ resultId?: string }>();
  const pathname = usePathname();
  const resultId = params?.resultId || null;

  const safeSetSelectedPreset = useCallback(
    (presetId: number | null) => {
      if (!presetId) {
        setSelectedPreset(null);
        return;
      }

      if (presetsLoaded) {
        const preset = presets.find((p) => p.id === presetId);
        setSelectedPreset(preset || null);
      } else {
        pendingPresetIdRef.current = presetId;
      }
    },
    [presets, presetsLoaded, setSelectedPreset],
  );

  // Set result with optional navigation
  const setResult = useCallback(
    (newResult: Result | null, navigate = false) => {
      setResultState(newResult);
      setError(null);

      if (newResult) {
        justSetResultRef.current = true;

        if (newResult.selectedPresetId) {
          safeSetSelectedPreset(newResult.selectedPresetId);
        }

        if (newResult.inputCables) {
          setTableData(newResult.inputCables);
        }

        if (navigate) {
          if (newResult?.id) {
            window.history.replaceState({ resultId: newResult.id }, '', `/${newResult.id}`);
          }
        }
      }
    },
    [safeSetSelectedPreset, setTableData],
  );

  // Reset all state
  const resetResult = useCallback(() => {
    setResultState(null);
    setError(null);
    resetTableData();
    resetPresets();
    justSetResultRef.current = false;
    pendingPresetIdRef.current = null;
  }, [resetPresets, resetTableData]);

  // Fetch result by ID
  const fetchResult = useCallback(
    async (id: string): Promise<boolean> => {
      if (!id?.trim()) return false;

      setError(null);
      setLoading(true);

      try {
        const response = await getResultByIdAction(id.trim());

        if (response.success && response.data) {
          setResult(response.data);
          setHasChangedSinceGeneration(false);
          setError(null);
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
    },
    [setHasChangedSinceGeneration, setResult],
  );

  // Keep stable refs so route effect does not re-fire on callback identity changes.
  useEffect(() => {
    fetchResultRef.current = fetchResult;
  }, [fetchResult]);

  useEffect(() => {
    resetResultRef.current = resetResult;
  }, [resetResult]);

  // Apply pending preset when presets load
  useEffect(() => {
    if (presetsLoaded && pendingPresetIdRef.current) {
      const presetToApply = presets.find((preset) => preset.id === pendingPresetIdRef.current);
      if (presetToApply) {
        setSelectedPreset(presetToApply);
      }
      pendingPresetIdRef.current = null;
    }
  }, [presets, presetsLoaded, setSelectedPreset]);

  // Auto-fetch on route change
  useEffect(() => {
    if (resultId && result?.id === resultId) {
      return; // Already have this result
    }

    if (resultId && justSetResultRef.current) {
      justSetResultRef.current = false;
      return; // Just set the result manually
    }

    if (resultId) {
      fetchResultRef.current(resultId);
    } else if (pathname === '/') {
      resetResultRef.current();
    }
  }, [resultId, pathname, result?.id]);

  const value = useMemo(
    () => ({
      result,
      loading,
      error,
      resultId,
      setResult,
      setLoading,
      setError,
      fetchResult,
      resetResult,
    }),
    [error, fetchResult, loading, resetResult, result, resultId, setResult],
  );

  return <ResultContext.Provider value={value}>{children}</ResultContext.Provider>;
}
