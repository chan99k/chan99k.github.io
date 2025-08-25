'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { useMemo } from 'react';

interface BreadcrumbItem {
  label: string;
  href: string;
  isCurrentPage?: boolean;
}

interface BreadcrumbsProps {
  customItems?: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ customItems, className = '' }: BreadcrumbsProps) {
  const pathname = usePathname();

  const breadcrumbItems = useMemo(() => {
    if (customItems) {
      return customItems;
    }

    const pathSegments = pathname.split('/').filter(Boolean);
    const items: BreadcrumbItem[] = [
      { label: 'Home', href: '/' }
    ];

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;
      
      // Generate human-readable labels
      let label = segment.charAt(0).toUpperCase() + segment.slice(1);
      
      // Handle special cases
      if (segment === 'blog') label = 'Blog';
      else if (segment === 'portfolio') label = 'Portfolio';
      else if (segment === 'reviews') label = 'Reviews';
      else if (segment === 'search') label = 'Search';
      else {
        // Convert kebab-case to title case
        label = segment
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }

      items.push({
        label,
        href: currentPath,
        isCurrentPage: isLast
      });
    });

    return items;
  }, [pathname, customItems]);

  // Don't show breadcrumbs on home page
  if (pathname === '/') {
    return null;
  }

  return (
    <nav 
      className={`flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 ${className}`}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-1">
        {breadcrumbItems.map((item, index) => (
          <li key={item.href} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />
            )}
            {item.isCurrentPage ? (
              <span 
                className="font-medium text-gray-900 dark:text-gray-100"
                aria-current="page"
              >
                {index === 0 && <Home className="w-4 h-4 inline mr-1" />}
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {index === 0 && <Home className="w-4 h-4 inline mr-1" />}
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}