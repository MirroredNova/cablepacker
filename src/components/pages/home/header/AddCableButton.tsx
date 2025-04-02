'use client';

import Button from '@mui/material/Button';
import React from 'react';
import useTable from '@/hooks/useTable';
import useResult from '@/hooks/useResult';

function AddCableButton() {
  const { addRow } = useTable();
  const { error, loading } = useResult();

  return (
    <Button
      variant="outlined"
      onClick={addRow}
      sx={{ mt: error ? 0 : 2 }}
      disabled={loading}
    >
      Add Cable
    </Button>
  );
}

export default AddCableButton;
