import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Result } from '@/types/domain.types';

type Props = {
  result: Result;
};

function ResultsInformation({ result }: Props) {
  return (
    <Box display="flex" flexDirection="column" gap={1} width={300}>
      <Typography variant="h5">Results Information</Typography>
      <Typography variant="body1">
        <Box component="span" fontWeight="bold">
          Result ID:
        </Box>
        {' '}
        {result.id}
      </Typography>
      <Typography variant="body1">
        <Box component="span" fontWeight="bold">
          Generated at:
        </Box>
        {' '}
        {new Date(result.createdAt).toLocaleString(undefined, { timeZoneName: 'short' })}
      </Typography>
      <Typography variant="body1">
        <Box component="span" fontWeight="bold">
          Minimum Bore Diameter:
        </Box>
        {' '}
        {(result.boreDiameter).toFixed(3)}
        in
      </Typography>
    </Box>
  );
}

export default ResultsInformation;
