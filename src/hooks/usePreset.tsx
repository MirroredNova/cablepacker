import { useContext } from 'react';
import { PresetContext } from '@/components/providers/PresetProvider';

export default function usePreset() {
  const context = useContext(PresetContext);
  if (!context) {
    throw new Error('usePresetContext must be used within a PresetProvider');
  }
  return context;
}
