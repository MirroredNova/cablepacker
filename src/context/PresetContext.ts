import { createContext } from 'react';
import { CreateCableInput, Preset, UpdateCableInput } from '@/types/domain.types';

export type PresetContextType = {
  presets: Preset[];
  selectedPreset: Preset | null;
  presetsLoaded: boolean;
  loading: boolean;
  error: string | null;
  setSelectedPreset: (preset: Preset | null) => void;
  resetPresets: () => void;
  loadPresets: () => Promise<void>;
  addPreset: (name: string) => Promise<void>;
  updatePreset: (id: number, updates: Partial<Preset>) => Promise<void>;
  deletePreset: (id: number) => Promise<void>;
  addCableToPreset: (presetId: number, cable: CreateCableInput) => Promise<void>;
  editCable: (cableId: number, updates: Partial<UpdateCableInput>) => Promise<void>;
  deleteCableFromPreset: (presetId: number, cableId: number) => Promise<void>;
};

export const PresetContext = createContext<PresetContextType | null>(null);
