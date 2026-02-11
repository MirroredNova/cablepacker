'use client';

import { useParams, useRouter } from 'next/navigation';
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

  const pendingPresetIdRef = useRef<number | null>(null);

  const { presets, setSelectedPreset, resetPresets, presetsLoaded } = usePreset();
  const { setTableData, resetTableData, setHasChangedSinceGeneration } = useTable();
  const router = useRouter();

  const params = useParams<{ resultId?: string }>();
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
    (newResult: Result | null, navigate: boolean | 'replace' | 'push' = false) => {
      setResultState(newResult);
      setError(null);

      if (newResult) {
        if (newResult.selectedPresetId) {
          safeSetSelectedPreset(newResult.selectedPresetId);
        }

        if (newResult.inputCables) {
          setTableData(newResult.inputCables);
        }

        if (navigate && newResult?.id) {
          const mode = navigate === true ? 'replace' : navigate;
          if (mode === 'push') {
            router.push(`/${newResult.id}`);
          } else {
            router.replace(`/${newResult.id}`);
          }
        }
      }
    },
    [router, safeSetSelectedPreset, setTableData],
  );

  // Reset all state
  const resetResult = useCallback(() => {
    setResultState(null);
    setError(null);
    resetTableData();
    resetPresets();
    pendingPresetIdRef.current = null;
  }, [resetPresets, resetTableData]);

  // Fetch result by ID
  const fetchResult = useCallback(
    async (id: string, navigate: boolean | 'replace' | 'push' = false): Promise<boolean> => {
      if (!id?.trim()) return false;

      setError(null);
      setLoading(true);

      try {
        const response = await getResultByIdAction(id.trim());

        if (response.success && response.data) {
          setResult(response.data, navigate);
          setHasChangedSinceGeneration(false);
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
