import Link from 'next/link';
import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AddCableButton from '@/components/pages/admin/cables/AddCableButton';
import CableTable from '@/components/pages/admin/cables/CableTable';
import AddPresetButton from '@/components/pages/admin/presets/AddPresetButton';
import PresetsTable from '@/components/pages/admin/presets/PresetsTable';
import SelectedPresetHeader from '@/components/pages/admin/presets/SelectedPresetHeader';
import { logoutAction } from '@/server/actions/admin.actions';

function AdminDashboard() {
  return (
    <Stack spacing={4}>
      <Stack direction="row" justifyContent="space-between" spacing={2} alignItems="flex-end">
        <Typography variant="h4">Preset Management</Typography>
        <Stack direction="row" spacing={2}>
          <Link href="/">
            <Button variant="contained">Home</Button>
          </Link>
          <Button onClick={logoutAction} variant="contained">
            Logout
          </Button>
        </Stack>
      </Stack>

      {/* Left side - Preset List */}
      <Box sx={{ display: 'flex', gap: 4 }}>
        <Box
          sx={{
            width: 300,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              pb: 1,
            }}
          >
            <Typography variant="h6">Presets</Typography>
            <AddPresetButton />
          </Box>
          <Divider />
          <Box sx={{ maxHeight: 500, overflow: 'auto', mt: 2 }}>
            <List sx={{ p: 0 }}>
              <PresetsTable />
            </List>
          </Box>
        </Box>

        {/* Right side - Cables Table */}
        <Box sx={{ flex: 1 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              pb: 1,
            }}
          >
            <SelectedPresetHeader />
            <AddCableButton />
          </Box>
          <Divider />
          <Box sx={{ mt: 2 }}>
            <CableTable />
          </Box>
        </Box>
      </Box>
    </Stack>
  );
}

export default AdminDashboard;
