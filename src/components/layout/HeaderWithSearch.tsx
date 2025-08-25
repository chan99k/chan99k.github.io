'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { NAVIGATION_ITEMS, SITE_CONFIG } from '@/lib/constants';
import { SearchWidget } from '@/components/search';
import { BlogPost, RestaurantReview, PortfolioData } from '@/types';
import { AdvancedThemeToggle } from './AdvancedThemeToggle';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';

interface HeaderWithSearchProps {
  blogPosts: BlogPost[];
  restaurantReviews: RestaurantReview[];
  portfolioData: PortfolioData | null;
}

export function HeaderWithSearch({
  blogPosts,
  restaurantReviews,
  portfolioData,
}: HeaderWithSearchProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActivePath = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setIsMobileMenuOpen(false);
    };

    if (isMobileMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isMobileMenuOpen]);

  return (
    <header className='sticky top-0 z-50 w-full border-b bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm'>
      <div className='container mx-auto px-4'>
        <div className='flex h-16 items-center justify-between'>
          {/* Logo/Brand */}
          <div className='flex items-center'>
            <Link
              href='/'
              className='flex items-center space-x-2 font-bold text-lg hover:text-blue-600 transition-colors'
            >
              <span>{SITE_CONFIG.name}</span>
            </Link>
          </div>

          {/* Desktop Navigation and Search */}
          <div className='hidden lg:flex items-center space-x-6 flex-1 justify-center max-w-2xl'>
            {/* Search Widget */}
            <div className='flex-1 max-w-md'>
              <SearchWidget
                blogPosts={blogPosts}
                restaurantReviews={restaurantReviews}
                portfolioData={portfolioData}
                placeholder="Search content..."
                maxResults={4}
              />
            </div>
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
            <AdvancedThemeToggle />
          </nav>

          {/* Mobile Menu Button */}
          <div className='md:hidden flex items-center space-x-2'>
            <AdvancedThemeToggle />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMobileMenuOpen(!isMobileMenuOpen);
              }}
              className='p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
              aria-label='Toggle mobile menu'
            >
              {isMobileMenuOpen ? (
                <X className='w-5 h-5' />
              ) : (
                <Menu className='w-5 h-5' />
              )}
            </button>
          </div>
        </div>

        {/* Breadcrumbs */}
        {pathname !== '/' && (
          <div className="py-2 border-t border-gray-100 dark:border-gray-800">
            <Breadcrumbs />
          </div>
        )}

        {/* Mobile Search (always visible on mobile) */}
        <div className='lg:hidden pb-4'>
          <SearchWidget
            blogPosts={blogPosts}
            restaurantReviews={restaurantReviews}
            portfolioData={portfolioData}
            placeholder="Search content..."
            maxResults={3}
          />
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className='md:hidden border-t border-gray-200 dark:border-gray-700'>
            <nav className='py-4 space-y-2'>
              {NAVIGATION_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-4 py-2 text-sm font-medium transition-colors ${
                    isActivePath(item.href)
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
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