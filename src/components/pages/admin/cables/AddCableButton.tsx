'use client';

import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import AddIcon from '@mui/icons-material/Add';
import EnhancedNumberInput from '@/components/shared/NumberInput';
import usePreset from '@/hooks/usePreset';
import useAdmin from '@/hooks/useAdmin';
import { CreateCableInput } from '@/types/domain.types';

function AddCableButton() {
  const { selectedPreset } = useAdmin();
  const { addCableToPreset } = usePreset();
  const [isAddCableDialogOpen, setIsAddCableDialogOpen] = useState(false);
  const [editingCable, setEditingCable] = useState<CreateCableInput | null>(null);

  const handleAddCable = () => {
    if (selectedPreset && editingCable) {
      const newCable: CreateCableInput = {
        presetId: selectedPreset.id,
        name: editingCable.name,
        diameter: editingCable.diameter,
      };
      addCableToPreset(selectedPreset.id, newCable);
      setIsAddCableDialogOpen(false);
      setEditingCable(null);
    }
  };

  return (
    <>
      {selectedPreset && (
        <Button
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingCable({ presetId: selectedPreset.id, name: '', diameter: 1 });
            setIsAddCableDialogOpen(true);
          }}
          size="small"
        >
          Add Cable
        </Button>
      )}

      <Dialog open={isAddCableDialogOpen} onClose={() => setIsAddCableDialogOpen(false)}>
        <DialogTitle>Add New Cable</DialogTitle>
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
          <Button onClick={() => setIsAddCableDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddCable}>Add</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default AddCableButton;
