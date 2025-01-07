import React from 'react';
import { Roboto } from 'next/font/google';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { CssBaseline } from '@mui/material';
import theme from '../theme';
import './globals.css';
import CableProvider from '@/providers/CableProvider';

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
              <CableProvider>
                {children}
              </CableProvider>
              <CssBaseline />
            </ThemeProvider>
          </AppRouterCacheProvider>
        </StyledEngineProvider>
      </body>
    </html>
  );
}
