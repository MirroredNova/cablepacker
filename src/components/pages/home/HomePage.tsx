import React from 'react';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import CableBoreGenerationPanel from '@/components/pages/home/CableBoreTable';
import HeaderForm from '@/components/pages/home/HeaderForm';
import GenerateBoreButton from '@/components/pages/home/GenerateBoreButton';
import ResultsArea from '@/components/pages/home/ResultsArea';
import CableBoreTableAlert from './CableBoreTableAlert';

function HomePage() {
  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
        <HeaderForm />
      </Stack>
      <CableBoreGenerationPanel />
      <CableBoreTableAlert />
      <Box display="flex" justifyContent="flex-end" mt={2}>
        <GenerateBoreButton />
      </Box>
      <ResultsArea />
    </Stack>
  );
}

export default HomePage;
