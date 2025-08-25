import { ReactNode } from 'react';
import { HeaderWrapper } from './HeaderWrapper';
import { Footer } from './Footer';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { PWAProvider } from '@/components/providers/PWAProvider';
import { NavigationProvider } from '@/components/navigation/NavigationProvider';
import { KeyboardShortcutsHelp } from '@/components/navigation/KeyboardShortcutsHelp';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <ThemeProvider>
      <PWAProvider>
        <NavigationProvider>
          <div className='min-h-screen-safe flex flex-col touch-manipulation'>
            <HeaderWrapper />
            <main className='flex-1 relative'>
              {children}
            </main>
            <Footer />
            <KeyboardShortcutsHelp />
          </div>
        </NavigationProvider>
      </PWAProvider>
    </ThemeProvider>
  );
}
