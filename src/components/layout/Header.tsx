import Link from 'next/link';
import { NAVIGATION_ITEMS, SITE_CONFIG } from '@/lib/constants';

export function Header() {
  return (
    <header className='sticky top-0 z-50 w-full border-b bg-white dark:bg-gray-900'>
      <div className='container mx-auto px-4'>
        <div className='flex h-16 items-center justify-between'>
          {/* Logo/Brand */}
          <div>
            <Link
              href='/'
              className='flex items-center space-x-2 font-bold text-lg hover:text-blue-600 transition-colors'
            >
              <span>{SITE_CONFIG.name}</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className='hidden md:flex items-center space-x-6'>
            {NAVIGATION_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className='text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors'
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Navigation */}
          <div className='md:hidden'>
            <nav className='flex items-center space-x-4'>
              {NAVIGATION_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className='text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors'
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}