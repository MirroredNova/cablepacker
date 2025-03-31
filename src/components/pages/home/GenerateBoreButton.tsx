'use client';

import Button from '@mui/material/Button';
import React, { useState } from 'react';
import { CircularProgress } from '@mui/material';
import { useRouter } from 'next/navigation';
import useTable from '@/hooks/useTable';
import { generateBoreAction } from '@/server/actions/bore.actions';
import usePreset from '@/hooks/usePreset';

function GenerateBoreButton() {
  const router = useRouter();
  const { selectedPreset } = usePreset();
  const { tableData, setError } = useTable();
  const [loading, setLoading] = useState(false);

  const handleGenerateBore = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await generateBoreAction(tableData, selectedPreset ? selectedPreset.id : null);

      if (result.success && result.data) {
        if (result.data.id) {
          router.push(`/${result.data.id}`);
        }
      } else if (!result.success && result.error) {
        setError({ message: result.error.message });
        console.error('Error generating bore:', result.error);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError({ message: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="contained"
      onClick={handleGenerateBore}
      disabled={tableData.length === 0 || loading}
      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
    >
      {loading ? 'Calculating...' : 'Generate Bore'}
    </Button>
  );
}

export default GenerateBoreButton;
