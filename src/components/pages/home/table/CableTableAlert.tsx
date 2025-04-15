'use client';

import React, { useEffect } from 'react';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import useTable from '@/hooks/useTable';

function CableTableAlert() {
  const { error, setError } = useTable();

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, error.timeout || 5000);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [error, setError]);

  if (!error) return null;

  return (
    <Alert severity="error">
      <Typography variant="body2">
        {error.message}
      </Typography>
    </Alert>
  );
}

export default CableTableAlert;
