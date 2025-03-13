'use client';

import Button from '@mui/material/Button';
import React from 'react';
import useTableContext from '@/hooks/useTableContext';
import { generateBore } from '@/services/bore.services';

function GenerateBore() {
  const { tableData } = useTableContext();

  const handleGenerateBore = async () => {
    try {
      const res = await generateBore(tableData);
      console.log('Generating bore with data:', tableData);
      console.log(await res.json());
    } catch (error) {
      console.error('Error generating bore:', error);
    }
  };

  return (
    <Button variant="contained" onClick={handleGenerateBore} disabled={tableData.length === 0}>
      Generate Bore
    </Button>
  );
}

export default GenerateBore;
