import React from 'react';
import Stack from '@mui/material/Stack';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import CableTableData from '@/components/pages/home/table/CableTableData';
import GenerateBoreButton from '@/components/pages/home/table/GenerateBoreButton';
import ResultsArea from '@/components/pages/home/results/ResultsArea';
import CableTableAlert from '@/components/pages/home/table/CableTableAlert';
import HeaderPresetSelect from '@/components/pages/home/header/HeaderPresetSelect';
import SearchExistingForm from '@/components/pages/home/header/SearchExistingForm';
import AddCableButton from '@/components/pages/home/header/AddCableButton';
import CableTotal from '@/components/pages/home/table/CableTotal';

function HomePage() {
  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between">
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="start">
          <FormControl sx={{ minWidth: '200px' }} size="small">
            <InputLabel id="preset-select-label">Preset</InputLabel>
            <HeaderPresetSelect />
          </FormControl>
          <SearchExistingForm />
        </Stack>
        <AddCableButton />
      </Stack>

      <TableContainer>
        <Table aria-label="cable configuration table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell width="120px">Diameter (in)</TableCell>
              <TableCell width="120px">Quantity</TableCell>
              <TableCell align="right" width="1px">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <CableTableData />
          </TableBody>
        </Table>
      </TableContainer>

      <CableTableAlert />

      <Stack direction="row" justifyContent="flex-end" spacing={4} alignItems="center">
        <CableTotal />
        <GenerateBoreButton />
      </Stack>

      <ResultsArea />
    </Stack>
  );
}

export default HomePage;
