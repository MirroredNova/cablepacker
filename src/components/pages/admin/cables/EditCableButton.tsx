'use client';

import React, { useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { Cable, UpdateCableInput } from '@/types/domain.types';
import usePreset from '@/hooks/usePreset';
import useAdmin from '@/hooks/useAdmin';
import EnhancedNumberInput from '@/components/shared/NumberInput';

type Props = {
  cable: Cable;
};

function EditCableButton({ cable }: Props) {
  const { selectedPreset } = useAdmin();
  const { editCable } = usePreset();

  const [editingCable, setEditingCable] = useState<UpdateCableInput | null>(null);
  const [isEditCableDialogOpen, setIsEditCableDialogOpen] = useState(false);

  const handleEditCable = () => {
    if (selectedPreset && editingCable) {
      editCable(cable.id, editingCable);
      setIsEditCableDialogOpen(false);
      setEditingCable(null);
    }
  };

  return (
    <>
      <IconButton
        size="small"
        aria-label="edit"
        onClick={() => {
          setEditingCable({ ...cable, category: cable.category ?? undefined });
          setIsEditCableDialogOpen(true);
        }}
      >
        <EditIcon fontSize="small" />
      </IconButton>

      <Dialog open={isEditCableDialogOpen} onClose={() => setIsEditCableDialogOpen(false)}>
        <DialogTitle>Edit Cable</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              autoFocus
              label="Cable Name"
              fullWidth
              value={editingCable?.name || ''}
              onChange={(e) => setEditingCable((prev) => (prev ? { ...prev, name: e.target.value } : null))}
            />
            <EnhancedNumberInput
              label="Diameter"
              value={editingCable?.diameter || 1}
              onChangeAction={(value) => setEditingCable((prev) => (prev ? { ...prev, diameter: value } : null))}
              min={0.1}
              max={20}
              step={0.1}
              decimalPlaces={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditCableDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditCable}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default EditCableButton;
