import Link from 'next/link';
import { SITE_CONFIG } from '@/lib/constants';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className='border-t bg-white dark:bg-gray-900'>
      <div className='container mx-auto px-4 py-6'>
        <div className='flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0'>
          {/* Copyright */}
          <div className='text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left'>
            © {currentYear} {SITE_CONFIG.author.name}. All rights reserved.
          </div>

          {/* Links */}
          <div className='flex items-center space-x-4 text-sm'>
            <Link
              href='/blog'
              className='text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors'
            >
              Blog
            </Link>
            <Link
              href='/portfolio'
              className='text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors'
            >
              Portfolio
            </Link>
            <Link
              href='/reviews'
              className='text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors'
            >
              Reviews
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}