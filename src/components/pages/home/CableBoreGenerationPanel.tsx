/* eslint-disable react/no-array-index-key */
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import React from 'react';
import Box from '@mui/material/Box';
import useCables from '@/hooks/useCables';
import CableTableRow from './CableTableRow';
import { DEFAULT_CABLE } from '@/constants';

function CableBoreGenerationPanel() {
  const {
    cables, addCable, presets, setSelectedPreset, selectedPreset,
  } = useCables();

  const handleChange = (event: SelectChangeEvent) => {
    setSelectedPreset(event.target.value);
  };

  const handleAddCable = () => {
    addCable(DEFAULT_CABLE);
  };

  return (
    <Stack spacing={2}>
      <Stack
        direction="row"
        spacing={4}
        sx={{
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" spacing={4}>
          <FormControl fullWidth sx={{ maxWidth: '160px' }} size="small">
            <InputLabel id="preset-select-label">Preset</InputLabel>
            <Select labelId="preset-select-label" id="preset-select" value={selectedPreset} label="Preset" onChange={handleChange}>
              <MenuItem value="default">Default</MenuItem>
              {presets.map((preset, index) => (
                <MenuItem key={index} value={preset.name}>
                  {preset.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ flexDirection: 'row', gap: 2 }}>
            <TextField id="retrieve-existing-input" label="Search Existing Result ID" size="small" sx={{ minWidth: '300px' }} />
            <Button variant="contained">Submit</Button>
          </FormControl>
        </Stack>
        <Button variant="outlined" onClick={handleAddCable}>
          Add New Cable
        </Button>
      </Stack>
      <TableContainer>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Diameter</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cables.map((cable, i) => (
              <CableTableRow cable={cable} key={i} index={i} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box display="flex" justifyContent="flex-end">
        <Button variant="contained">Generate Bore</Button>
      </Box>
    </Stack>
  );
}

export default CableBoreGenerationPanel;
