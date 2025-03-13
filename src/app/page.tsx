import React from 'react';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import CableBoreGenerationPanel from '@/components/pages/home/CableBoreTable';
import HeaderForm from '@/components/pages/home/HeaderForm';
import GenerateBore from '@/components/pages/home/GenerateBore';

export default function Home() {
  return (
    <Stack spacing={2}>
      <Stack
        direction="row"
        spacing={2}
        sx={{
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >

        <HeaderForm />
      </Stack>
      <CableBoreGenerationPanel />
      <Box display="flex" justifyContent="flex-end" mt={2}>
        <GenerateBore />
      </Box>
    </Stack>
  );
}
