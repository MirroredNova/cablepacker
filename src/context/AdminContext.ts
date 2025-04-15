import { createContext } from 'react';
import { Preset } from '@/types/domain.types';

export type AdminContextType = {
  selectedPreset: Preset | null;
  selectedPresetId: number | null;
  setSelectedPresetId: (id: number | null) => void;
};

export const AdminContext = createContext<AdminContextType | null>(null);
