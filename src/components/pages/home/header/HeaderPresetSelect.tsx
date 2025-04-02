'use client';

import React from 'react';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Spinner from '@/components/shared/Spinner';
import usePreset from '@/hooks/usePreset';
import useResult from '@/hooks/useResult';
import useTable from '@/hooks/useTable';

function HeaderPresetSelect() {
  const {
    presets, selectedPreset, setSelectedPreset, presetsLoaded, loading: presetLoading,
  } = usePreset();
  const { resetTableData } = useTable();
  const { loading: resultLoading } = useResult();

  const handlePresetChange = (event: SelectChangeEvent) => {
    const presetName = event.target.value as string;
    const preset = presets.find((p) => p.name === presetName);
    setSelectedPreset(preset || null);
    resetTableData();
  };

  const isLoading = presetLoading || !presetsLoaded || resultLoading;

  return (
    <Select
      labelId="preset-select-label"
      id="preset-select"
      value={selectedPreset?.name || ''}
      label="Preset"
      onChange={handlePresetChange}
      disabled={isLoading}
      IconComponent={isLoading ? () => Spinner({ select: true }) : ArrowDropDownIcon}
    >
      <MenuItem value="">None</MenuItem>
      {presets.map((preset) => (
        <MenuItem key={preset.id} value={preset.name}>
          {preset.name}
        </MenuItem>
      ))}
    </Select>
  );
}

export default HeaderPresetSelect;
