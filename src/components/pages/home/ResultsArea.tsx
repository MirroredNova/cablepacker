'use client';

import React from 'react';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import ResultsGraphic from './ResultsGraphic';
import { useResult } from '@/hooks/useResult';
import ResultsInformation from './ResultsInformation';
import ResultsCables from './ResultsCables';
import ResultsActions from './ResultsActions';

function ResultsArea() {
  const { result } = useResult();

  return (
    result && (
      <Stack spacing={2}>
        <Divider />
        <ResultsActions />
        <Stack direction="row" spacing={2}>
          {result.cables.length >= 0 && <ResultsGraphic bore={result.bore} data={result.cables} />}
          <ResultsInformation bore={result.bore} />
          <ResultsCables cables={result.cables} />
        </Stack>
      </Stack>
    )
  );
}

export default ResultsArea;
