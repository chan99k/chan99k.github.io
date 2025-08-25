'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAVIGATION_ITEMS, SITE_CONFIG } from '@/lib/constants';
import { Breadcrumbs } from './Breadcrumbs';
import { AdvancedThemeToggle } from '@/components/layout/AdvancedThemeToggle';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

interface EnhancedHeaderProps {
  showBreadcrumbs?: boolean;
  customBreadcrumbs?: Array<{
    label: string;
    href: string;
    isCurrentPage?: boolean;
  }>;
}

export function EnhancedHeader({ 
  showBreadcrumbs = true, 
  customBreadcrumbs 
}: EnhancedHeaderProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActivePath = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <header className='sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-sm dark:bg-gray-900/95'>
      <div className='container mx-auto px-4'>
        {/* Main header */}
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
                className={`text-sm font-medium transition-colors ${
                  isActivePath(item.href)
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Theme Toggle & Mobile Menu Button */}
          <div className="flex items-center space-x-2">
            <AdvancedThemeToggle />
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Breadcrumbs */}
        {showBreadcrumbs && (
          <div className="py-2 border-t border-gray-100 dark:border-gray-800">
            <Breadcrumbs customItems={customBreadcrumbs} />
          </div>
        )}

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 dark:border-gray-800">
            <nav className="flex flex-col space-y-2">
              {NAVIGATION_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActivePath(item.href)
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}