import React, { useMemo } from 'react';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import Autocomplete from '@mui/material/Autocomplete';
import IconButton from '@mui/material/IconButton';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import { TableRowData } from '@/types/table';
import { Cable } from '@/types/cables';
import useTable from '@/hooks/useTable';
import usePreset from '@/hooks/usePreset';
import { getMaxDiameter } from '@/config';
import EnhancedNumberInput from '@/components/shared/NumberInput';

type Props = {
  row: TableRowData;
};

export default function CableTableRow({ row }: Props) {
  const { selectedPreset } = usePreset();
  const { updateRow, deleteRow } = useTable();

  const isPresetCable = useMemo(() => row.selectedCable !== 'custom', [row.selectedCable]);

  const options = useMemo(() => {
    const customOption = { id: 'custom', name: 'Custom', diameter: row.customDiameter || 1 };
    return selectedPreset?.cables ? [customOption, ...selectedPreset.cables] : [customOption];
  }, [selectedPreset?.cables, row.customDiameter]);

  const handleNameChange = (_event: React.SyntheticEvent<Element, Event>, value: Cable | null) => {
    if (value?.id === 'custom') {
      updateRow(row.id, {
        selectedCable: 'custom',
        customName: row.customName || 'Custom',
        customDiameter: row.customDiameter || 1,
      });
    } else if (value) {
      updateRow(row.id, {
        selectedCable: value,
      });
    }
  };

  const getDiameterDisplay = (): string | number => {
    if (isPresetCable) {
      return (row.selectedCable as Cable).diameter;
    }
    return row.customDiameter ?? 1;
  };

  return (
    <TableRow>
      <TableCell sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
        <Autocomplete
          value={isPresetCable ? (row.selectedCable as Cable) : options[0]}
          options={options}
          getOptionLabel={(option) => option.name}
          onChange={(event, value) => handleNameChange(event, value)}
          fullWidth
          size="small"
          renderInput={(params) => <TextField {...params} label="Cable Type" />}
        />
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
          <EnhancedNumberInput
            value={row.customDiameter ?? 1}
            onChangeAction={(value) => updateRow(row.id, { customDiameter: value })}
            min={0.1}
            max={getMaxDiameter()}
            step={0.1}
            allowTemporaryZero
            decimalPlaces={1}
            name="customDiameter"
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
