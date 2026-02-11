'use client';

import createTheme from '@mui/material/styles/createTheme';

const appTheme = createTheme({
  palette: {
    primary: {
      main: '#046FA8',
      light: '#CDE5F1',
      dark: '#015987',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#3f3f3f',
      light: '#CCCCCC',
      dark: '#616161',
    },
    info: {
      main: 'rgba(255, 255, 255, 0.87)',
    },
    warning: {
      main: '#e4a11b',
    },
  },
});

export default appTheme;
