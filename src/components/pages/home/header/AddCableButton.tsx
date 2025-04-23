'use client';

import React from 'react';
import AddIcon from '@mui/icons-material/Add';
import Button from '@mui/material/Button';
import useResult from '@/hooks/useResult';
import useTable from '@/hooks/useTable';

function AddCableButton() {
  const { addRow } = useTable();
  const { error, loading } = useResult();

  return (
    <Button variant="outlined" onClick={addRow} sx={{ mt: error ? 0 : 2 }} disabled={loading} startIcon={<AddIcon />}>
      Add Cable
    </Button>
  );
}

export default AddCableButton;
