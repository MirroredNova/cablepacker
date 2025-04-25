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
  const cableCounts = cables.reduce(
    (acc, cable) => {
      const key = `${cable.name}-${cable.diameter}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const uniqueCables = Object.entries(cableCounts).map(([key, count]) => {
    const [name, diameterStr] = key.split('-');
    const diameter = parseFloat(diameterStr);

    const cable = cables.find((c) => c.name === name && c.diameter === diameter)!;

    return {
      ...cable,
      quantity: count,
    };
  });

  return (
    <Box display="flex" flexDirection="column" gap="8px" flex={1} className="ResultsCables">
      <Typography variant="h5">Cables</Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell align="right">Diameter (in)</TableCell>
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
              <TableCell align="right">{cable.diameter.toFixed(3)}</TableCell>
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
                  title={`${cable.name} (${cable.diameter}in)`}
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
