'use client';

import React, { PropsWithChildren, useState, useMemo } from 'react';
import usePreset from '@/hooks/usePreset';
import { AdminContext } from '@/context/AdminContext';

export default function AdminProvider({ children }: PropsWithChildren) {
  const [selectedPresetId, setSelectedPresetId] = useState<number | null>(null);

  const { presets } = usePreset();

  const selectedPreset = useMemo(
    () => presets.find((preset) => preset.id === selectedPresetId) || null,
    [presets, selectedPresetId],
  );

  const value = useMemo(
    () => ({
      selectedPreset,
      selectedPresetId,
      setSelectedPresetId,
    }),
    [selectedPreset, selectedPresetId],
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}
