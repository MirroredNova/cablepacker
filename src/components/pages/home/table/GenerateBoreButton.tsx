'use client';

import React, { useState } from 'react';
import Button from '@mui/material/Button';
import usePreset from '@/hooks/usePreset';
import useResult from '@/hooks/useResult';
import useTable from '@/hooks/useTable';
import { generateBoreAction } from '@/server/actions/bore.actions';
import Spinner from '@/components/shared/Spinner';

function GenerateBoreButton() {
  const { selectedPreset } = usePreset();
  const { tableData, setError: setTableError } = useTable();
  const { setResult } = useResult();

  const [loading, setLoading] = useState(false);

  const handleGenerateBore = async () => {
    try {
      setLoading(true);
      setTableError(null);

      const result = await generateBoreAction(tableData, selectedPreset ? selectedPreset.id : null);

      if (result.success && result.data) {
        setResult(result.data, true);
      } else if (!result.success && result.error) {
        setTableError({ message: result.error });
        console.error('Error generating bore:', result.error);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setTableError({ message: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="contained"
      onClick={handleGenerateBore}
      disabled={tableData.length === 0 || loading}
      startIcon={loading ? <Spinner /> : null}
    >
      {loading ? 'Calculating...' : 'Generate Bore'}
    </Button>
  );
}

export default GenerateBoreButton;
