'use client';

import React from 'react';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useParams } from 'next/navigation';
import ResultsActions from '@/components/pages/home/ResultsActions';
import ResultsCables from '@/components/pages/home/ResultsCables';
import ResultsGraphic from '@/components/pages/home/ResultsGraphic';
import ResultsInformation from '@/components/pages/home/ResultsInformation';
import useResult from '@/hooks/useResult';

function ResultsArea() {
  const {
    result, loading, error, resultId,
  } = useResult();
  const params = useParams<{ resultId?: string }>();
  const isResultPage = params?.resultId !== undefined;

  // Show loading spinner when fetching results
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show error message when result lookup failed
  if (error && (isResultPage || resultId)) {
    return (
      <Alert
        severity="error"
        sx={{ mt: 2 }}
      >
        <Typography variant="h6" component="div" gutterBottom>
          Error Loading Result
        </Typography>
        <Typography variant="body2">
          {error}
        </Typography>
        {resultId && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            Result ID:
            {' '}
            {resultId}
          </Typography>
        )}
      </Alert>
    );
  }

  // Result exists, show the visualization
  return result && (
    <Stack spacing={2}>
      <Divider />
      <ResultsActions resultId={result.id} />
      <Stack direction="row" spacing={2}>
        {result.cables.length > 0 && <ResultsGraphic bore={result.bore} data={result.cables} />}
        <ResultsInformation result={result} />
        <ResultsCables cables={result.cables} />
      </Stack>
    </Stack>
  );
}

export default ResultsArea;
