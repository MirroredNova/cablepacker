'use client';

import React from 'react';
import ListItem from '@mui/material/ListItem';
import Box from '@mui/material/Box';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import usePreset from '@/hooks/usePreset';
import EditPresetButton from './EditPresetButton';
import DeletePresetButton from './DeletePresetButton';
import useAdmin from '@/hooks/useAdmin';

function PresetsTable() {
  const { presets } = usePreset();
  const { setSelectedPresetId } = useAdmin();

  if (presets.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
        No presets available. Add one to get started.
      </Typography>
    );
  }

  return presets.map((preset) => (
    <ListItem
      key={preset.id}
      onClick={() => setSelectedPresetId(preset.id)}
      sx={{
        borderRadius: 1,
        mb: 0.5,
        '&:hover': { bgcolor: 'action.hover' },
      }}
      secondaryAction={(
        <Box>
          <EditPresetButton preset={preset} />
          <DeletePresetButton preset={preset} />
        </Box>
      )}
    >
      <ListItemText primary={preset.name} secondary={`${(preset.cables ?? []).length} cables`} />
    </ListItem>
  ));
}

export default PresetsTable;
