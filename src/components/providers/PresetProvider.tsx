'use client';

import React, {
  createContext, PropsWithChildren, useState, useMemo, useCallback,
} from 'react';
import { Preset } from '@/types/cables';
import { EXAMPLE_PRESETS } from '@/constants';

type PresetContextType = {
  presets: Preset[];
  selectedPreset: Preset | null;
  setSelectedPreset: (preset: Preset | null) => void;
  loadPresets: () => Promise<void>;
};

export const PresetContext = createContext<PresetContextType | null>(null);

export default function PresetProvider({ children }: PropsWithChildren) {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<Preset | null>(null);

  // Using useCallback for functions passed to context
  const loadPresets = useCallback(async () => {
    try {
      // In a real app, this would be an API call
      // const response = await fetch('/api/presets');
      // const data = await response.json();
      // setPresets(data);
      setPresets(EXAMPLE_PRESETS);
    } catch (error) {
      console.error('Failed to load presets:', error);
    }
  }, []);

  const value = useMemo(() => ({
    presets,
    selectedPreset,
    setSelectedPreset,
    loadPresets,
  }), [presets, selectedPreset, loadPresets]);

  return (
    <PresetContext.Provider value={value}>
      {children}
    </PresetContext.Provider>
  );
}
