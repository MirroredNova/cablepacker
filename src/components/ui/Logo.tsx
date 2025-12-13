import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import React from 'react';

function Logo() {
  return (
    <Link href="/" style={{ textDecoration: 'none' }}>
      <Stack direction="row" alignItems="center" spacing={{ xs: 1, md: 2 }} sx={{ width: 'fit-content' }}>
        <Box
          component="img"
          src="/logo.png"
          alt="Cable Packer Logo"
          sx={{
            height: { xs: 80, md: 100, lg: 120 },
            maxHeight: { xs: 80, md: 100, lg: 120 },
          }}
        />
        <Typography
          variant="h2"
          component="h1"
          sx={{
            fontWeight: 600,
            color: 'text.primary',
            fontSize: { xs: '2rem', md: '2.5rem', lg: '3rem' },
            whiteSpace: 'nowrap',
          }}
        >
          Cable Packer
        </Typography>
      </Stack>
    </Link>
  );
}

export default Logo;
