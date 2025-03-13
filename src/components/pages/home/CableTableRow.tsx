import React, { useMemo } from 'react';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton'; // Added for better semantics
import NumberInput from '@/components/shared/NumberInput';
import { TableRowData } from '@/types/table';
import { Cable } from '@/types/cables';
import usePresetContext from '@/hooks/usePresetContext';
import useTableContext from '@/hooks/useTableContext';

type Props = {
  row: TableRowData;
};

export default function CableTableRow({ row }: Props) {
  const { selectedPreset } = usePresetContext();
  const { updateRow, deleteRow } = useTableContext();

  const isPresetCable = useMemo(
    () => row.selectedCable !== 'custom',
    [row.selectedCable],
  );

  const handleNameChange = (event: SelectChangeEvent) => {
    const selectedName = event.target.value as string;
    const selectedCable = selectedPreset?.cables.find(
      (cable) => cable.name === selectedName,
    );

    if (selectedName === 'custom') {
      updateRow(row.id, {
        selectedCable: 'custom',
        customName: row.customName || 'Custom',
        customDiameter: row.customDiameter || 1,
      });
    } else if (selectedCable) {
      updateRow(row.id, {
        selectedCable,
      });
    }
  };

  const getDiameterDisplay = (): string | number => {
    if (isPresetCable) {
      return (row.selectedCable as Cable).diameter;
    }
    return row.customDiameter ?? 1;
  };

  const getNameValue = (): string => {
    if (isPresetCable) {
      return (row.selectedCable as Cable).name;
    }
    return 'custom';
  };

  return (
    <TableRow>
      <TableCell sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
        <Select
          value={getNameValue()}
          fullWidth
          size="small"
          onChange={handleNameChange}
        >
          <MenuItem value="custom">Custom</MenuItem>
          {selectedPreset?.cables.map((cable) => (
            <MenuItem key={cable.id} value={cable.name}>
              {cable.name}
            </MenuItem>
          ))}
        </Select>
        {row.selectedCable === 'custom' && (
          <TextField
            fullWidth
            size="small"
            label="Custom Name"
            value={row.customName}
            onChange={(e) => updateRow(row.id, { customName: e.target.value })}
          />
        )}
      </TableCell>
      <TableCell>
        {!isPresetCable ? (
          <NumberInput
            value={row.customDiameter}
            min={1}
            onChange={(e, value) => updateRow(row.id, { customDiameter: value || 1 })}
          />
        ) : (
          getDiameterDisplay()
        )}
      </TableCell>
      <TableCell>
        <NumberInput
          value={row.quantity}
          min={1}
          onChange={(e, value) => updateRow(row.id, { quantity: value || 1 })}
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
