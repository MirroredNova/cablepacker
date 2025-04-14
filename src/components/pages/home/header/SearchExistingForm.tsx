'use client';

import React, { useState } from 'react';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import { getResultByIdAction } from '@/server/actions/results.actions';
import useResult from '@/hooks/useResult';
import Spinner from '@/components/shared/Spinner';

function SearchExistingForm() {
  const {
    setResult, loading, setLoading, error, setError,
  } = useResult();

  const [searchId, setSearchId] = useState('');

  const handleSearchSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!searchId.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await getResultByIdAction(searchId.trim());

      if (response.success && response.data) {
        setResult(response.data, true);
        setSearchId('');
      } else {
        setError(response.error || 'Result not found');
      }
    } catch (err: any) {
      console.error('Error searching for result:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormControl
      sx={{
        display: 'flex', flexDirection: 'row', gap: 2, width: '100%',
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
