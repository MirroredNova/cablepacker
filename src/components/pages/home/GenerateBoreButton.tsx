'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { CircularProgress } from '@mui/material';
import Button from '@mui/material/Button';
import useResult from '@/hooks/useResult';
import useTable from '@/hooks/useTable';
import { generateBoreAction } from '@/server/actions/bore.actions';

function GenerateBoreButton() {
  const { tableData, setError } = useTable();
  const { setResult } = useResult();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleGenerateBore = async () => {
    try {
      setLoading(true);
      const result = await generateBoreAction(tableData);

      if (result.success && result.data) {
        setResult(result.data);

        if (result.data.id) {
          router.replace(`/${result.data.id}`);
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
