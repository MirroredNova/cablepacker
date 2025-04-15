'use client';

import React, { useState } from 'react';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import usePreset from '@/hooks/usePreset';
import { Preset } from '@/types/domain.types';

type Props = {
  preset: Preset;
};

function DeletePresetButton({ preset }: Props) {
  const { deletePreset } = usePreset();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDeletePreset = () => {
    deletePreset(preset.id);
    setIsDeleteDialogOpen(false);
  };
  return (
    <>
      <IconButton
        size="small"
        aria-label="delete"
        onClick={(e) => {
          e.stopPropagation();
          setIsDeleteDialogOpen(true);
        }}
      >
        <DeleteIcon fontSize="small" />
      </IconButton>

      <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)}>
        <DialogTitle>Delete Preset</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this preset? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeletePreset} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default DeletePresetButton;
