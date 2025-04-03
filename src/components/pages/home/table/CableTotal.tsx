'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import useTable from '@/hooks/useTable';
import { clientConfig } from '@/config';

function CableTotal() {
  const { tableData } = useTable();

  const cableTotal = tableData.reduce((total, row) => {
    const cableQuantity = row.quantity || 0;
    return total + cableQuantity;
  }, 0);

  const fillPercentage = Math.min(100, (cableTotal / clientConfig.MAX_CIRCLES) * 100);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <CircularProgress
        variant="determinate"
        value={fillPercentage}
        size={32}
        thickness={4}
        sx={{ color: cableTotal > 0 ? 'primary.main' : 'action.disabled' }}
      />
      <Box>
        <Typography variant="body2" color="text.secondary">
          Total Cables
        </Typography>
        <Typography variant="subtitle1" fontWeight="bold">
          {cableTotal}
        </Typography>
      </Box>
    </Box>
  );
}

export default CableTotal;
