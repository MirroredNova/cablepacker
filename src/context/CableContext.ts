import { createContext, Dispatch, SetStateAction } from 'react';
import { Cable, Preset } from '@/types/cables';

interface CableContextType {
  cables: Cable[];
  setCables: Dispatch<SetStateAction<Cable[]>>;
  presets: Preset[];
  setPresets: Dispatch<SetStateAction<Preset[]>>;
  selectedPreset: string;
  setSelectedPreset: Dispatch<SetStateAction<string>>;
  presetCables: Cable[];
}

const CableContext = createContext<CableContextType | undefined>(undefined);

export default CableContext;
