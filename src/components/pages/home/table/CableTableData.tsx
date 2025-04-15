'use client';

import React from 'react';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import useTable from '@/hooks/useTable';
import CableTableRow from '@/components/pages/home/table/CableTableRow';

function CableTableData() {
  const { tableData } = useTable();

  return tableData.length === 0 ? (
    <TableRow>
      <TableCell colSpan={4} align="center">
        No cables added. Click &quot;Add Cable&quot; to begin.
      </TableCell>
    </TableRow>
  ) : (
    tableData.map((row) => <CableTableRow key={row.id} row={row} />)
  );
}

export default CableTableData;
