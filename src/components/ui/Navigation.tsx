'use client';

import React, { PropsWithChildren } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

export default function Navigation({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const value = pathname === '/help' ? 1 : 0;

  return (
    <>
      <Tabs value={value} aria-label="navigation tabs">
        <Tab label="Cable Bore Generator" component={Link} href="/" />
        <Tab label="Help" component={Link} href="/help" />
      </Tabs>
      {children}
    </>
  );
}
