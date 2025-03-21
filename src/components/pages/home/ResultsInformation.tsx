import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Circle } from '@/types/algorithm';

type Props = {
  bore: Circle;
};

function ResultsInformation({ bore }: Props) {
  return (
    <Box display="flex" flexDirection="column" gap={1} width={300}>
      <Typography variant="h5">Results Information</Typography>
      <Typography variant="body1">
        <Box component="span" fontWeight="bold">
          Result ID:
        </Box>
        {' '}
        TEMPTESTID
      </Typography>
      <Typography variant="body1">
        <Box component="span" fontWeight="bold">
          Generated at:
        </Box>
        {' '}
        {new Date().toLocaleString()}
      </Typography>
      <Typography variant="body1">
        <Box component="span" fontWeight="bold">
          Minimum Bore Diameter:
        </Box>
        {' '}
        {(bore.radius * 2).toFixed(3)}
        in
      </Typography>
    </Box>
  );
}

export default ResultsInformation;
