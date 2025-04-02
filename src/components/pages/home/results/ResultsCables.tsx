import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import { Circle } from '@/types/algorithm.types';

type Props = {
  cables: Circle[];
};

function ResultsCables({ cables }: Props) {
  // Count occurrences of each cable type
  const cableCounts = cables.reduce(
    (acc, cable) => {
      const key = `${cable.name}-${cable.diameter}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  // Create unique cable entries with counts
  const uniqueCables = Object.entries(cableCounts).map(([key, count]) => {
    const [name] = key.split('-');
    const cable = cables.find((c) => c.name === name)!;
    return {
      ...cable,
      quantity: count,
    };
  });

  return (
    <Box display="flex" flexDirection="column" gap="8px" flex={1}>
      <Typography variant="h5">Cables</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell align="right">Diameter (in)</TableCell>
            <TableCell align="right">Quantity</TableCell>
            <TableCell align="center">Color</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {uniqueCables.map((cable, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <TableRow key={index}>
              <TableCell>{cable.name}</TableCell>
              <TableCell align="right">{cable.diameter}</TableCell>
              <TableCell align="right">{cable.quantity}</TableCell>
              <TableCell align="center">
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    backgroundColor: cable.color,
                    margin: '0 auto',
                    borderRadius: '50%',
                  }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

export default ResultsCables;
