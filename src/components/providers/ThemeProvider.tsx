'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { ReactNode } from 'react';

interface CustomThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: CustomThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
      themes={[
        'light',
        'dark',
        'system',
        'high-contrast-light',
        'high-contrast-dark',
        'sepia',
        'custom-blue',
        'custom-green',
        'custom-purple'
      ]}
    >
      {children}
    </NextThemesProvider>
  );
}