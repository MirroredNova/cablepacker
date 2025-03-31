'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { getResultByIdAction } from '@/server/actions/results.actions';
import useTable from '@/hooks/useTable';
import usePreset from '@/hooks/usePreset';

function HeaderForm() {
  const router = useRouter();

  const { presets, selectedPreset, setSelectedPreset } = usePreset();
  const { addRow } = useTable();
  const { resetTableData } = useTable();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchId, setSearchId] = useState('');

  const handlePresetChange = (event: SelectChangeEvent) => {
    const presetName = event.target.value as string;
    const preset = presets.find((p) => p.name === presetName);
    setSelectedPreset(preset || null);
    resetTableData();
  };

  const handleSearchSubmit = async () => {
    if (!searchId.trim()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const resultResponse = await getResultByIdAction(searchId.trim());

      if (resultResponse.success && resultResponse.result) {
        router.push(`/${searchId.trim()}`);
      } else {
        setError(resultResponse.error || 'Result not found');
      }
    } catch (err: any) {
      console.error('Error searching for result:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
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
            disabled={loading}
          >
            <MenuItem value="">None</MenuItem>
            {presets.map((preset) => (
              <MenuItem key={preset.id} value={preset.name}>
                {preset.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl
          sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}
          component="form"
          action={handleSearchSubmit}
        >
          <TextField
            id="retrieve-existing-input"
            label="Search Existing Result ID"
            size="small"
            sx={{ width: '300px' }}
            value={searchId}
            onChange={(e) => {
              setSearchId(e.target.value);
              if (error) setError(null);
            }}
            disabled={loading}
            error={!!error}
          />
          <Button
            variant="contained"
            type="submit"
            disabled={loading || !searchId.trim()}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </FormControl>
      </Stack>

      <Collapse in={!!error}>
        <Alert severity="error" sx={{ mt: 1, mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      </Collapse>

      <Button
        variant="outlined"
        onClick={addRow}
        sx={{ mt: error ? 0 : 2 }}
        disabled={loading}
      >
        Add Cable
      </Button>
    </>
  );
}

export default HeaderForm;
