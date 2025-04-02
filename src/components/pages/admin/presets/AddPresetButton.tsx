'use client';

import React, { useState } from 'react';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import usePreset from '@/hooks/usePreset';

function AddPresetButton() {
  const { addPreset } = usePreset();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');

  const handleAddPreset = () => {
    if (newPresetName.trim()) {
      addPreset(newPresetName);
      setNewPresetName('');
      setIsAddDialogOpen(false);
    }
  };

  return (
    <>
      <Button startIcon={<AddIcon />} onClick={() => setIsAddDialogOpen(true)} size="small">
        Add Preset
      </Button>

      <Dialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)}>
        <DialogTitle>Add New Preset</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Preset Name"
            fullWidth
            value={newPresetName}
            onChange={(e) => setNewPresetName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddPreset}>Add</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default AddPresetButton;
