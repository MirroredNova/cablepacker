import React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import CableBoreTableData from './CableBoreTableData';

export default function CableBoreGenerationPanel() {
  return (
    <TableContainer>
      <Table aria-label="cable configuration table">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell sx={{ width: '150px' }}>Diameter (in)</TableCell>
            <TableCell sx={{ width: '150px' }}>Quantity</TableCell>
            <TableCell align="right" sx={{ width: '1px' }}>
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <CableBoreTableData />
        </TableBody>
      </Table>
    </TableContainer>
  );
}
