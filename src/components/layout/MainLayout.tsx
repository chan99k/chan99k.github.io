import { ReactNode } from 'react';
import { HeaderWrapper } from './HeaderWrapper';
import { Footer } from './Footer';
import { ThemeProvider } from '@/components/providers/ThemeProvider';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <ThemeProvider>
      <div className='min-h-screen-safe flex flex-col touch-manipulation'>
        <HeaderWrapper />
        <main className='flex-1 relative'>
          {children}
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}
