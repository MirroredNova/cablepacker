'use client';

import React from 'react';
import Typography from '@mui/material/Typography';
import useAdmin from '@/hooks/useAdmin';

function SelectedPresetHeader() {
  const { selectedPreset } = useAdmin();

  return (
    <Typography variant="h6">{selectedPreset ? `Cables in ${selectedPreset.name}` : 'Select a preset'}</Typography>
  );
}

export default SelectedPresetHeader;
