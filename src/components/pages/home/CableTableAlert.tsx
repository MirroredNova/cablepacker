'use client';

import React, { useEffect } from 'react';
import Alert from '@mui/material/Alert';
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
      {error.message}
    </Alert>
  );
}

export default CableTableAlert;
