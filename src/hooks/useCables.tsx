import { useContext } from 'react';
import CableContext from '@/context/CableContext';
import { Cable, Preset } from '@/types/cables';

const useCables = () => {
  const context = useContext(CableContext);

  if (!context) {
    throw new Error('useCables must be used within a CableProvider');
  }

  const {
    cables, setCables, presets, setPresets, selectedPreset, setSelectedPreset, presetCables,
  } = context;

  const addCable = (cable: Cable) => {
    setCables((prevCables) => [...prevCables, cable]);
  };

  const removeCable = (index: number) => {
    setCables((prevCables) => prevCables.filter((_, i) => i !== index));
  };

  const editCable = (index: number, updatedCable: Cable) => {
    setCables((prevCables) => prevCables.map((cable, i) => (i === index ? updatedCable : cable)));
  };

  const addPreset = (preset: Preset) => {
    setPresets((prevPresets) => [...prevPresets, preset]);
  };

  return {
    cables,
    addCable,
    removeCable,
    editCable,
    presets,
    addPreset,
    selectedPreset,
    setSelectedPreset,
    presetCables,
  };
};

export default useCables;
