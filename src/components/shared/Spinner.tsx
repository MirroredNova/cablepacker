import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';

type Props = {
  select?: boolean;
};

function Spinner({ select }: Props) {
  return (
    <CircularProgress
      color="inherit"
      size={20}
      sx={
        select
          ? {
            position: 'absolute',
            top: '55%',
            left: '90%',
            marginTop: '-12px',
            marginLeft: '-12px',
          }
          : {}
      }
    />
  );
}

export default Spinner;
