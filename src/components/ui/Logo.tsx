import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import React from 'react';

function Logo() {
  return (
    <Link href="/" style={{ textDecoration: 'none' }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ width: 'fit-content' }}>
        <Box component="img" height={120} maxHeight={120} src="/logo.png" alt="Cable Packer Logo" />
        <Typography variant="h2" component="h1" sx={{ fontWeight: 600, color: 'text.primary' }}>
          Cable Packer
        </Typography>
      </Stack>
    </Link>
  );
}

export default Logo;
