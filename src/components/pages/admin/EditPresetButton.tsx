'use client';

import React, { useState } from 'react';
import Button from '@mui/material/Button';
import EditIcon from '@mui/icons-material/Edit';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import usePreset from '@/hooks/usePreset';
import { Preset } from '@/types/domain.types';

type Props = {
  preset: Preset;
};

function EditPresetButton({ preset }: Props) {
  const { updatePreset } = usePreset();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPreset, setEditingPreset] = useState<Preset | null>(null);

  const handleEditPreset = () => {
    if (editingPreset && editingPreset.name.trim()) {
      updatePreset(editingPreset.id, { name: editingPreset.name });
      setEditingPreset(null);
      setIsEditDialogOpen(false);
    }
  };
  return (
    <>
      <IconButton
        size="small"
        aria-label="edit"
        onClick={(e) => {
          e.stopPropagation();
          setEditingPreset({ ...preset });
          setIsEditDialogOpen(true);
        }}
      >
        <EditIcon fontSize="small" />
      </IconButton>
      {/* Edit Preset Dialog */}
      <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)}>
        <DialogTitle>Edit Preset</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Preset Name"
            fullWidth
            value={editingPreset?.name || ''}
            onChange={(e) => setEditingPreset((prev) => (prev ? { ...prev, name: e.target.value } : null))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditPreset}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default EditPresetButton;
