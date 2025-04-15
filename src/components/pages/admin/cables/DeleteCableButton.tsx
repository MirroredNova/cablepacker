import React from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import useAdmin from '@/hooks/useAdmin';
import usePreset from '@/hooks/usePreset';
import { Cable } from '@/types/domain.types';

type Props = {
  cable: Cable;
};

function DeleteCableButton({ cable }: Props) {
  const { selectedPreset } = useAdmin();
  const { deleteCableFromPreset } = usePreset();

  const handleDeleteCable = async (cableId: number) => {
    if (selectedPreset) {
      await deleteCableFromPreset(selectedPreset.id, cableId);
    }
  };

  return (
    <IconButton size="small" aria-label="delete" onClick={() => handleDeleteCable(cable.id)}>
      <DeleteIcon fontSize="small" />
    </IconButton>
  );
}

export default DeleteCableButton;
