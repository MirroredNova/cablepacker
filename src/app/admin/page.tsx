'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/login');
  }, [router]);

  // This will briefly show while the client-side redirect happens
  return <Box>Redirecting...</Box>;
}
