import { useContext } from 'react';
import { PresetContext } from '@/components/providers/PresetProvider';

const usePresetContext = () => {
  const context = useContext(PresetContext);
  if (!context) {
    throw new Error('usePresetContext must be used within a PresetProvider');
  }
  return context;
};

export default usePresetContext;
