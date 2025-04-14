'use client';

import React, { useRef } from 'react';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import ResultsCables from '@/components/pages/home/results/ResultsCables';
import ResultsGraphic from '@/components/pages/home/results/ResultsGraphic';
import ResultsInformation from '@/components/pages/home/results/ResultsInformation';
import ResultsCopyLinkButton from '@/components/pages/home/results/ResultsCopyLinkButton';
import ResultsExportButton from '@/components/pages/home/results/ResultsExportButton';
import ResultsEmailButton from '@/components/pages/home/results/ResultsEmailButton';
import useResult from '@/hooks/useResult';
import Spinner from '@/components/shared/Spinner';

function ResultsArea() {
  const { result, loading, error } = useResult();
  const contentRef = useRef<HTMLDivElement>(null);

  // Show loading spinner when fetching results
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <Spinner />
      </Box>
    );
  }

  // Show error message when result lookup failed
  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        <Typography variant="h6" component="div" gutterBottom>
          Error Loading Result
        </Typography>
        <Typography variant="body2">{error}</Typography>
      </Alert>
    );
  }

  return (
    result && (
      <Stack spacing={2}>
        <Divider />
        <Stack direction="row" spacing={2}>
          <ResultsExportButton contentRef={contentRef as React.RefObject<HTMLDivElement>} />
          <ResultsCopyLinkButton />
          <ResultsEmailButton />
        </Stack>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} ref={contentRef}>
          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
            {result.resultData.cables.length > 0 && (
            <ResultsGraphic
              bore={result.resultData.bore}
              data={result.resultData.cables}
            />
            )}
            <ResultsInformation result={result} />
          </Stack>
          <ResultsCables cables={result.resultData.cables} />
        </Stack>
      </Stack>
    )
  );
}

export default ResultsArea;
