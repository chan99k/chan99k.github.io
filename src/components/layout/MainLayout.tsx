import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { PageTransition } from '@/components/ui';
import { ScrollToTop } from '@/components/ui/scroll-to-top';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className='min-h-screen-safe flex flex-col touch-manipulation'>
      <Header />
      <main className='flex-1 relative'>
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}
