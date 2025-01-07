'use client';

import React, { useState, ReactNode, useMemo } from 'react';
import CableContext from '@/context/CableContext';
import { Cable, Preset } from '@/types/cables';

const examplePresets: Preset[] = [
  {
    name: 'Display Cables',
    cables: [
      { name: 'HDMI', diameter: 1.5, quantity: 2 },
      { name: 'USB', diameter: 0.5, quantity: 5 },
    ],
  },
  {
    name: 'Data Cables',
    cables: [
      { name: 'Ethernet', diameter: 0.8, quantity: 3 },
      { name: 'Power', diameter: 1.2, quantity: 4 },
    ],
  },
  {
    name: 'Audio Cables',
    cables: [
      { name: 'VGA', diameter: 1.0, quantity: 1 },
      { name: 'Audio', diameter: 0.3, quantity: 6 },
    ],
  },
];

export default function CableProvider({ children }: { children: ReactNode }) {
  const [cables, setCables] = useState<Cable[]>([]);
  const [presets, setPresets] = useState<Preset[]>(examplePresets);
  const [selectedPreset, setSelectedPreset] = useState<string>('default');

  const presetCables = useMemo(() => {
    const foundPreset = presets.find((preset) => preset.name === selectedPreset);
    return foundPreset?.cables || [];
  }, [presets, selectedPreset]);

  const value = useMemo(() => ({
    cables, setCables, presets, setPresets, selectedPreset, setSelectedPreset, presetCables,
  }), [cables, presetCables, presets, selectedPreset]);

  return <CableContext.Provider value={value}>{children}</CableContext.Provider>;
}
