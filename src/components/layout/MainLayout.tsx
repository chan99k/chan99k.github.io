import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className='min-h-screen-safe flex flex-col touch-manipulation'>
      <Header />
      <main className='flex-1 relative'>
        {children}
      </main>
      <Footer />
    </div>
  );
}
