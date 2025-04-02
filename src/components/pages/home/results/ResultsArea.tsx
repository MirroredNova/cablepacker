'use client';

import React from 'react';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useParams } from 'next/navigation';
import ResultsActions from '@/components/pages/home/results/ResultsActions';
import ResultsCables from '@/components/pages/home/results/ResultsCables';
import ResultsGraphic from '@/components/pages/home/results/ResultsGraphic';
import ResultsInformation from '@/components/pages/home/results/ResultsInformation';
import useResult from '@/hooks/useResult';
import Spinner from '@/components/shared/Spinner';

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
        <Spinner />
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

  return result && (
    <Stack spacing={2}>
      <Divider />
      <ResultsActions resultId={result.id} />
      <Stack direction="row" spacing={2}>
        {result.resultData.cables.length > 0 && (
          <ResultsGraphic
            bore={result.resultData.bore}
            data={result.resultData.cables}
          />
        )}
        <ResultsInformation result={result} />
        <ResultsCables cables={result.resultData.cables} />
      </Stack>
    </Stack>
  );
}

export default ResultsArea;
