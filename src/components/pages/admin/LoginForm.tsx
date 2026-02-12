import React from 'react';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { signInAction } from '@/server/actions/admin.actions';

function LoginForm() {
  return (
    <Stack maxWidth={400} spacing={2} width="100%">
      <Typography variant="h4">Sign in</Typography>
      <Stack spacing={2} component="form" noValidate alignItems="flex-start" action={signInAction}>
        <FormControl fullWidth>
          <FormLabel htmlFor="username">Username</FormLabel>
          <TextField
            id="username"
            type="text"
            name="username"
            placeholder="username"
            autoComplete="username"
            autoFocus
            required
            variant="outlined"
            size="small"
          />
        </FormControl>
        <FormControl fullWidth>
          <FormLabel htmlFor="password">Password</FormLabel>
          <TextField
            name="password"
            placeholder="••••••••"
            type="password"
            id="password"
            autoComplete="current-password"
            required
            variant="outlined"
            size="small"
          />
        </FormControl>
        <Button type="submit" variant="contained">
          Sign in
        </Button>
      </Stack>
    </Stack>
  );
}

export default LoginForm;
