import Box from '@mui/material/Box';
import Link from 'next/link';
import React from 'react';

function Logo() {
  return (
    <Link href="/">
      <Box component="img" height={120} maxHeight={120} src="/logo.svg" alt="Alliant Energy Logo" />
    </Link>
  );
}

export default Logo;
