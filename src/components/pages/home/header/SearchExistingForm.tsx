'use client';

import React, { useState } from 'react';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import useResult from '@/hooks/useResult';
import Spinner from '@/components/shared/Spinner';

function SearchExistingForm() {
  const { loading, error, setError, fetchResult } = useResult();

  const [searchId, setSearchId] = useState('');

  const handleSearchSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const trimmedId = searchId.trim();
    if (!trimmedId) return;

    const success = await fetchResult(trimmedId, 'push');
    if (success) {
      setSearchId('');
    }
  };

  return (
    <FormControl
      sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: 2,
        width: '100%',
      }}
      component="form"
      onSubmit={handleSearchSubmit}
    >
      <TextField
        id="retrieve-existing-input"
        label="Search Existing Result ID"
        size="small"
        value={searchId}
        onChange={(e) => {
          setSearchId(e.target.value);
          if (error) setError(null);
        }}
        sx={{ flexGrow: { xs: 1, md: 0 } }}
        disabled={loading}
        error={!!error}
      />
      <Button
        variant="contained"
        type="submit"
        disabled={loading || !searchId.trim()}
        endIcon={loading ? <Spinner /> : null}
      >
        {loading ? 'Searching...' : 'Search'}
      </Button>
    </FormControl>
  );
}

export default SearchExistingForm;
