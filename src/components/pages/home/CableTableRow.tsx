/* eslint-disable react/no-array-index-key */
import React, { useState } from 'react';
import CheckIcon from '@mui/icons-material/Check';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { Cable } from '@/types/cables';
import useCables from '@/hooks/useCables';

type Props = {
  cable: Cable;
  index: number;
};

function CableTableRow({ cable, index }: Props) {
  const { removeCable, editCable, presetCables } = useCables();
  const [editing, setEditing] = useState(false);
  const [editedCable, setEditedCable] = useState<Cable>(cable);

  const handleSaveEdit = () => {
    editCable(index, editedCable);
    setEditing(false);
  };

  const handleOnDelete = () => {
    removeCable(index);
  };

  return (
    <TableRow>
      <TableCell>
        {editing ? (
          <Select value={editedCable.name} size="small" onChange={(e) => setEditedCable({ ...editedCable, name: e.target.value })}>
            <MenuItem value="custom">Custom</MenuItem>
            {presetCables.map((c, i) => (
              <MenuItem key={i} value={c.name}>
                {c.name}
              </MenuItem>
            ))}
          </Select>
        ) : (
          cable.name
        )}
      </TableCell>
      <TableCell>
        {editing ? (
          <TextField
            value={editedCable.diameter}
            onChange={(e) => setEditedCable({ ...editedCable, diameter: Number(e.target.value) })}
            type="number"
            size="small"
          />
        ) : (
          cable.diameter
        )}
      </TableCell>
      <TableCell>
        {editing ? (
          <TextField
            value={editedCable.quantity}
            onChange={(e) => setEditedCable({ ...editedCable, quantity: Number(e.target.value) })}
            type="number"
            size="small"
          />
        ) : (
          cable.quantity
        )}
      </TableCell>
      <TableCell align="right">
        {editing
          ? <CheckIcon onClick={handleSaveEdit} />
          : <EditIcon onClick={() => setEditing(true)} />}
        <DeleteOutlineIcon onClick={handleOnDelete} />
      </TableCell>
    </TableRow>
  );
}

export default CableTableRow;
