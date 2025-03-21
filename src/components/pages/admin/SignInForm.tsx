'use client';

import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import React, { useCallback } from 'react';
import { signInAction } from '@/server/admin.server';

type Props = {
  setAuthenticated: (authenticated: boolean) => void;
};

function SignInForm({ setAuthenticated }: Props) {
  const signIn = useCallback(
    async (formData: FormData) => {
      try {
        const username = formData.get('username') as string;
        const password = formData.get('password') as string;
        setAuthenticated(await signInAction(username, password));
      } catch (error) {
        console.error('Error signing in:', error);
      }
    },
    [setAuthenticated],
  );

  return (
    <Stack maxWidth={400} spacing={2} width="100%">
      <Typography variant="h4">Sign in</Typography>
      <Stack spacing={2} component="form" noValidate alignItems="flex-start" action={signIn}>
        <FormControl fullWidth>
          <FormLabel htmlFor="username">Username</FormLabel>
          <TextField
            id="username"
            type="username"
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
            autoFocus
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

export default SignInForm;
