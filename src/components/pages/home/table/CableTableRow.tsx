'use client';

import React, { useMemo } from 'react';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import { TableRowData } from '@/types/table.types';
import { Cable } from '@/types/domain.types';
import useTable from '@/hooks/useTable';
import { clientConfig } from '@/config';
import EnhancedNumberInput from '@/components/shared/NumberInput';
import usePreset from '@/hooks/usePreset';

type Props = {
  row: TableRowData;
};

export default function CableTableRow({ row }: Props) {
  const { selectedPreset, loading } = usePreset()!;
  const { updateRow, deleteRow } = useTable();

  const isPresetCable = useMemo(() => row.selectedCable !== 'custom', [row.selectedCable]);

  const options = useMemo(() => {
    const customOption = {
      id: -1, // Use a unique negative number to represent the custom option
      name: 'Custom',
      diameter: row.customDiameter || 1,
      presetId: 0,
      category: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (!selectedPreset?.cables?.length) {
      return [customOption];
    }

    return [customOption, ...selectedPreset.cables];
  }, [selectedPreset?.cables, row.customDiameter]);

  const handleNameChange = (_event: React.SyntheticEvent<Element, Event>, value: Cable | null) => {
    if (!value) return;

    if (value.id === -1) {
      updateRow(row.id, {
        selectedCable: 'custom',
        customName: row.customName || 'Custom',
        customDiameter: row.customDiameter || 1,
      });
    } else {
      updateRow(row.id, {
        selectedCable: value,
      });
    }
  };

  const getDiameterDisplay = (): string => {
    if (isPresetCable) {
      return `${(row.selectedCable as Cable).diameter.toFixed(2)} in`;
    }
    return `${(row.customDiameter ?? 1).toFixed(2)} in`;
  };

  return (
    <TableRow>
      <TableCell sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box
          display="flex"
          flexDirection="row"
          gap={1}
          width="100%"
          minWidth="400px"
        >
          <Autocomplete
            value={isPresetCable ? (row.selectedCable as Cable) : options[0]}
            options={options}
            getOptionLabel={(option) => option.name}
            onChange={handleNameChange}
            fullWidth
            size="small"
            disabled={loading}
            renderInput={(params) => (
              <TextField {...params} label="Cable" slotProps={{ inputLabel: { shrink: true } }} />
            )}
          />

          {row.selectedCable === 'custom' && (
            <TextField
              fullWidth
              size="small"
              label="Custom Name"
              value={row.customName}
              onChange={(e) => updateRow(row.id, { customName: e.target.value })}
              disabled={loading}
            />
          )}
        </Box>
      </TableCell>
      <TableCell>
        {!isPresetCable ? (
          <EnhancedNumberInput
            value={row.customDiameter ?? 1}
            onChangeAction={(value) => updateRow(row.id, { customDiameter: value })}
            min={0.1}
            max={clientConfig.MAX_DIAMETER}
            step={0.1}
            allowTemporaryZero
            decimalPlaces={1}
            name="customDiameter"
            sx={{ width: '85px' }}
          />
        ) : (
          getDiameterDisplay()
        )}
      </TableCell>
      <TableCell>
        <EnhancedNumberInput
          value={row.quantity}
          onChangeAction={(value) => updateRow(row.id, { quantity: value })}
          min={1}
          step={1}
          allowTemporaryZero={false}
          decimalPlaces={0}
          name="quantity"
          sx={{ width: '85px' }}
        />
      </TableCell>
      <TableCell align="right">
        <IconButton onClick={() => deleteRow(row.id)} aria-label="delete">
          <DeleteOutlineIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}
