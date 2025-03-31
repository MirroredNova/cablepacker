import './globals.css';

import { Roboto } from 'next/font/google';
import React from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import type { Metadata } from 'next';
import PresetProvider from '@/components/providers/PresetProvider';
import { ResultProvider } from '@/components/providers/ResultProvider';
import TableProvider from '@/components/providers/TableProvider';
import Logo from '@/components/ui/Logo';
import theme from '@/theme';

export const metadata: Metadata = {
  title: {
    default: 'Cable Packer',
    template: '%s | Cable Packer',
  },
};

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
});

type Props = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: Props) {
  return (
    <html lang="en">
      <body className={`${roboto.variable} h-screen`}>
        <StyledEngineProvider injectFirst>
          <AppRouterCacheProvider>
            <ThemeProvider theme={theme}>
              <TableProvider>
                <PresetProvider>
                  <ResultProvider>
                    <Box maxWidth="xl" marginX="auto" p={4}>
                      <Logo />
                      <Box pt={4} display="flex" flexDirection="column" gap={4}>
                        {children}
                      </Box>
                    </Box>
                  </ResultProvider>
                </PresetProvider>
              </TableProvider>
              <CssBaseline />
            </ThemeProvider>
          </AppRouterCacheProvider>
        </StyledEngineProvider>
      </body>
    </html>
  );
}
