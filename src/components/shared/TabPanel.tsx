import { Box } from '@mui/material';
import React, { PropsWithChildren } from 'react';

type Props = {
  index: number;
  value: number;
};

function TabPanel({ children, index, value }: PropsWithChildren<Props>) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default TabPanel;
