import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import { Circle } from '@/types/algorithm.types';

type Props = {
  cables: Circle[];
};

function ResultsCables({ cables }: Props) {
  const formatDiameter = (diameter: unknown) => (
    typeof diameter === 'number' && Number.isFinite(diameter) ? diameter.toFixed(3) : 'N/A'
  );

  const groupedCables = cables.reduce(
    (acc, cable) => {
      const key = JSON.stringify([cable.name, cable.diameter]);
      const existing = acc.get(key);
      if (existing) {
        existing.quantity += 1;
      } else {
        acc.set(key, { ...cable, quantity: 1 });
      }
      return acc;
    },
    new Map<string, Circle & { quantity: number }>(),
  );

  const uniqueCables = Array.from(groupedCables.values());

  return (
    <Box display="flex" flexDirection="column" gap="8px" flex={1} className="ResultsCables">
      <Typography variant="h5">Cables</Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell align="right">Diameter</TableCell>
              <TableCell align="right">Quantity</TableCell>
              <TableCell align="center">Color</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {uniqueCables.map((cable) => (
              <TableRow
                key={`${cable.name}-${cable.diameter}`}
                sx={{ '&:nth-of-type(odd)': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}
              >
                <TableCell>{cable.name}</TableCell>
                <TableCell align="right">{formatDiameter(cable.diameter)}</TableCell>
                <TableCell align="right">{cable.quantity}</TableCell>
                <TableCell align="center">
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      backgroundColor: cable.color,
                      margin: '0 auto',
                      borderRadius: '50%',
                      border: '1px solid rgba(0, 0, 0, 0.2)',
                    }}
                    title={`${cable.name} (${typeof cable.diameter === 'number' ? cable.diameter : 'N/A'}in)`}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default ResultsCables;
