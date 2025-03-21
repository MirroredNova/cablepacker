import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import React from 'react';
import DownloadIcon from '@mui/icons-material/DownloadOutlined';
import LinkIcon from '@mui/icons-material/Link';

function ResultsActions() {
  return (
    <Stack direction="row" spacing={2}>
      <Button variant="contained" color="primary" startIcon={<DownloadIcon />}>
        Export PDF
      </Button>
      <Button variant="contained" color="primary" startIcon={<LinkIcon />}>
        Share Link
      </Button>
    </Stack>
  );
}

export default ResultsActions;
