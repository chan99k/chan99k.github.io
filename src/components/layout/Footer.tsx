import Link from 'next/link';
import { Github, Mail, Rss } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/constants';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* 저작권 */}
          <div className="text-sm text-muted-foreground">
            © {currentYear} {SITE_CONFIG.author.name}. All rights reserved.
          </div>

          {/* 소셜 링크 */}
          <div className="flex items-center space-x-4">
            <Link
              href={SITE_CONFIG.social.github}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-accent"
              aria-label="GitHub"
            >
              <Github size={18} />
            </Link>
            
            <Link
              href={SITE_CONFIG.social.email}
              className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-accent"
              aria-label="Email"
            >
              <Mail size={18} />
            </Link>
            
            <Link
              href="/rss.xml"
              className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-accent"
              aria-label="RSS Feed"
            >
              <Rss size={18} />
            </Link>
          </div>
        </div>

        {/* 추가 푸터 링크 */}
        <div className="mt-6 pt-6 border-t text-center">
          <div className="flex flex-wrap justify-center items-center space-x-6 text-sm text-muted-foreground">
            <Link 
              href="/about" 
              className="hover:text-primary transition-colors"
            >
              About
            </Link>
            <Link 
              href="/blog" 
              className="hover:text-primary transition-colors"
            >
              Blog
            </Link>
            <Link 
              href="/portfolio" 
              className="hover:text-primary transition-colors"
            >
              Portfolio
            </Link>
            <Link 
              href="/reviews" 
              className="hover:text-primary transition-colors"
            >
              Reviews
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}