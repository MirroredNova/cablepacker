'use client';

import Button from '@mui/material/Button';
import React from 'react';
import useTable from '@/hooks/useTable';
import { useResult } from '@/hooks/useResult';
import { generateBoreAction } from '@/server/bore.server';

function GenerateBoreButton() {
  const { tableData, setError } = useTable();
  const { setResult } = useResult();

  const handleGenerateBore = async () => {
    const result = await generateBoreAction(tableData);
    if (result.success && result.data) {
      setResult(result.data);
    } else if (!result.success && result.error) {
      setError({ message: result.error.message });
      console.error('Error generating bore:', result.error);
    }
  };

  return (
    <Button variant="contained" onClick={handleGenerateBore} disabled={tableData.length === 0}>
      Generate Bore
    </Button>
  );
}

export default GenerateBoreButton;
