'use client';

import React, { useState } from 'react';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import useAdmin from '@/hooks/useAdmin';
import EditCableButton from '@/components/pages/admin/cables/EditCableButton';
import DeleteCableButton from '@/components/pages/admin/cables/DeleteCableButton';

function CableTable() {
  const { selectedPreset } = useAdmin();
  const [sortBy, setSortBy] = useState({ column: 'name', order: 'asc' });

  const handleSort = (column: string) => {
    setSortBy((prev) => ({
      column,
      order: prev.column === column && prev.order === 'asc' ? 'desc' : 'asc',
    }));
  };

  const sortedCables = React.useMemo(() => {
    if (!selectedPreset?.cables) return [];

    return [...selectedPreset.cables].sort((a, b) => {
      if (sortBy.column === 'name') {
        return sortBy.order === 'asc'
          ? a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
          : b.name.localeCompare(a.name, undefined, { sensitivity: 'base' });
      }
      if (sortBy.column === 'diameter') {
        return sortBy.order === 'asc' ? a.diameter - b.diameter : b.diameter - a.diameter;
      }
      if (sortBy.column === 'category') {
        // Handle undefined or null categories
        const categoryA = a.category || '';
        const categoryB = b.category || '';
        return sortBy.order === 'asc'
          ? categoryA.localeCompare(categoryB, undefined, { sensitivity: 'base' })
          : categoryB.localeCompare(categoryA, undefined, { sensitivity: 'base' });
      }
      return 0;
    });
  }, [selectedPreset, sortBy]);

  return selectedPreset ? (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>
              <Box display="flex" alignItems="center">
                <span>Name</span>
                <IconButton size="small" onClick={() => handleSort('name')}>
                  {sortBy.column === 'name' && sortBy.order === 'asc' ? (
                    <ArrowUpwardIcon fontSize="small" />
                  ) : (
                    <ArrowDownwardIcon fontSize="small" />
                  )}
                </IconButton>
              </Box>
            </TableCell>
            <TableCell>
              <Box display="flex" alignItems="center">
                <span>Category</span>
                <IconButton size="small" onClick={() => handleSort('category')}>
                  {sortBy.column === 'category' && sortBy.order === 'asc' ? (
                    <ArrowUpwardIcon fontSize="small" />
                  ) : (
                    <ArrowDownwardIcon fontSize="small" />
                  )}
                </IconButton>
              </Box>
            </TableCell>
            <TableCell>
              <Box display="flex" alignItems="center">
                <span>Diameter</span>
                <IconButton size="small" onClick={() => handleSort('diameter')}>
                  {sortBy.column === 'diameter' && sortBy.order === 'asc' ? (
                    <ArrowUpwardIcon fontSize="small" />
                  ) : (
                    <ArrowDownwardIcon fontSize="small" />
                  )}
                </IconButton>
              </Box>
            </TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedCables.map((cable) => (
            <TableRow key={cable.id}>
              <TableCell>{cable.name}</TableCell>
              <TableCell>{cable.category || ''}</TableCell>
              <TableCell>{cable.diameter}</TableCell>
              <TableCell align="right">
                <EditCableButton cable={cable} />
                <DeleteCableButton cable={cable} />
              </TableCell>
            </TableRow>
          ))}
          {sortedCables.length === 0 && (
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
