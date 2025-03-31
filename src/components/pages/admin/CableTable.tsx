'use client';

import React from 'react';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import useAdmin from '@/hooks/useAdmin';
import EditCableButton from './EditCableButton';
import DeleteCableButton from './DeleteCableButton';

function CableTable() {
  const { selectedPreset } = useAdmin();

  return selectedPreset ? (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Diameter</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(selectedPreset.cables ?? []).map((cable) => (
            <TableRow key={cable.id}>
              <TableCell>{cable.name}</TableCell>
              <TableCell>{cable.diameter}</TableCell>
              <TableCell align="right">
                <EditCableButton cable={cable} />
                <DeleteCableButton cable={cable} />
              </TableCell>
            </TableRow>
          ))}
          {(selectedPreset.cables ?? []).length === 0 && (
            <TableRow>
              <TableCell colSpan={3} align="center">
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                  No cables in this preset. Add one to get started.
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  ) : (
    <Box
      sx={{
        p: 4,
        textAlign: 'center',
        bgcolor: 'background.paper',
        borderRadius: 1,
      }}
    >
      <Typography variant="body1" color="text.secondary">
        Select a preset from the list to view and edit its cables
      </Typography>
    </Box>
  );
}

export default CableTable;
