'use client';

import React, { useEffect } from 'react';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import usePreset from '@/hooks/usePreset';
import useTable from '@/hooks/useTable';

function HeaderForm() {
  const {
    presets, selectedPreset, setSelectedPreset, loadPresets,
  } = usePreset();
  const { addRow } = useTable();

  useEffect(() => {
    loadPresets();
  }, [loadPresets]);

  const handlePresetChange = (event: SelectChangeEvent) => {
    const presetName = event.target.value as string;
    const preset = presets.find((p) => p.name === presetName);
    setSelectedPreset(preset || null);
  };

  return (
    <>
      <Stack direction="row" spacing={2} alignItems="center">
        <FormControl sx={{ width: '160px' }} size="small">
          <InputLabel id="preset-select-label">Preset</InputLabel>
          <Select
            labelId="preset-select-label"
            id="preset-select"
            value={selectedPreset?.name || ''}
            label="Preset"
            onChange={handlePresetChange}
          >
            <MenuItem value="">None</MenuItem>
            {presets.map((preset) => (
              <MenuItem key={preset.id} value={preset.name}>
                {preset.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          id="retrieve-existing-input"
          label="Search Existing Result ID"
          size="small"
          sx={{ width: '300px' }}
        />
        <Button variant="contained">Search</Button>
      </Stack>
      <Button variant="outlined" onClick={addRow}>
        Add Cable
      </Button>
    </>
  );
}

export default HeaderForm;
