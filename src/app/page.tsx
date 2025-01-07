'use client';

import React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

import TabPanel from '@/components/shared/TabPanel';
import CableBoreGenerationPanel from '@/components/pages/home/CableBoreGenerationPanel';

export default function Home() {
  const [pageValue, setPageValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setPageValue(newValue);
  };

  return (
    <Box sx={{
      px: 4, pt: 4, maxWidth: { xl: 'xl' }, marginX: 'auto',
    }}
    >
      <Tabs value={pageValue} onChange={handleChange} aria-label="basic tabs example">
        <Tab label="Cable Bore Generator" />
        <Tab label="Help" />
      </Tabs>
      <TabPanel value={pageValue} index={0}>
        <CableBoreGenerationPanel />
      </TabPanel>
      <TabPanel value={pageValue} index={1}>
        Help Panel
      </TabPanel>
    </Box>
  );
}
