import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        mt: 6,
        pt: 2,
        borderTop: 1,
        borderColor: 'divider',
      }}
    >
      <Typography variant="body2" color="text.secondary" align="center">
        {`© ${new Date().getFullYear()} Cable Packer`}
      </Typography>
    </Box>
  );
}

export default Footer;
