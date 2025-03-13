import { Box } from '@mui/material';
import React from 'react';

function Logo() {
  return (
    <Box
      sx={{
        px: 4,
        pt: 4,
        maxWidth: { xl: 'xl' },
        marginX: 'auto',
      }}
    >
      <Box
        component="img"
        sx={{
          height: 120,
          maxHeight: 120,
        }}
        src="/logo.svg"
        alt="Alliant Energy Logo"
      />
    </Box>
  );
}

export default Logo;
