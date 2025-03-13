import React from 'react';
import { Roboto } from 'next/font/google';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { CssBaseline } from '@mui/material';
import theme from '../theme';
import './globals.css';
import TableProvider from '@/components/providers/TableProvider';
import PresetProvider from '@/components/providers/PresetProvider';
import Navigation from '@/components/ui/Navigation';
import Logo from '@/components/ui/Logo';

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
                  <Logo />
                  <Navigation>{children}</Navigation>
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
