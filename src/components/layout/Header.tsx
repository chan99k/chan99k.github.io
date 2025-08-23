'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NAVIGATION_ITEMS, SITE_CONFIG } from '@/lib/constants';
import { ThemeToggle } from './ThemeToggle';
import { IconButton } from '@/components/ui';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <motion.header 
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-top"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div className="container-responsive">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          {/* 로고/브랜드 */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link 
              href="/" 
              className="flex items-center space-x-2 font-bold text-lg sm:text-xl hover:text-primary transition-colors touch-target"
            >
              <span>{SITE_CONFIG.name}</span>
            </Link>
          </motion.div>

          {/* 데스크톱 네비게이션 */}
          <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
            {NAVIGATION_ITEMS.map((item, index) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={item.href}
                  className={`text-sm font-medium transition-colors hover:text-primary relative px-2 py-1 rounded-md touch-target ${
                    pathname === item.href
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  }`}
                >
                  {item.label}
                  {pathname === item.href && (
                    <motion.div
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"
                      layoutId="activeTab"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* 데스크톱 테마 토글 */}
          <div className="hidden md:flex items-center">
            <ThemeToggle />
          </div>

          {/* 모바일 메뉴 버튼 */}
          <div className="flex items-center space-x-1 sm:space-x-2 md:hidden">
            <ThemeToggle />
            <IconButton
              onClick={toggleMenu}
              className="text-muted-foreground hover:text-primary touch-target"
              size="md"
            >
              <motion.div
                animate={{ rotate: isMenuOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </motion.div>
            </IconButton>
          </div>
        </div>

        {/* 모바일 네비게이션 */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="md:hidden border-t bg-background overflow-hidden safe-bottom"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
              <nav className="flex flex-col space-y-1 py-4 px-2">
                {NAVIGATION_ITEMS.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`px-4 py-3 text-base font-medium transition-colors hover:text-primary hover:bg-accent rounded-lg block touch-target ${
                        pathname === item.href
                          ? 'text-primary bg-accent'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}