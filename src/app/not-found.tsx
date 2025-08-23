import { FileQuestion, Home, Search, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 - Page Not Found',
  description: 'The page you are looking for could not be found.',
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <FileQuestion className="w-20 h-20 text-muted-foreground mx-auto mb-6" />
          
          <h1 className="text-4xl font-bold text-foreground mb-2">404</h1>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Page Not Found
          </h2>
          
          <p className="text-muted-foreground mb-8 leading-relaxed">
            The page you're looking for doesn't exist or has been moved. 
            Don't worry, let's get you back on track.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            <Home className="w-5 h-5" />
            Go Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-border text-foreground rounded-lg hover:bg-accent transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>

        <div className="mt-12 p-6 bg-muted rounded-lg text-left">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Search className="w-4 h-4" />
            Looking for something specific?
          </h3>
          
          <div className="space-y-3 text-sm text-muted-foreground">
            <div>
              <Link 
                href="/portfolio" 
                className="text-primary hover:underline font-medium"
              >
                Portfolio
              </Link>
              <p className="text-xs mt-1">View my projects and experience</p>
            </div>
            
            <div>
              <Link 
                href="/blog" 
                className="text-primary hover:underline font-medium"
              >
                Blog
              </Link>
              <p className="text-xs mt-1">Read technical articles and insights</p>
            </div>
            
            <div>
              <Link 
                href="/reviews" 
                className="text-primary hover:underline font-medium"
              >
                Restaurant Reviews
              </Link>
              <p className="text-xs mt-1">Discover great places to eat</p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-xs text-muted-foreground">
          <p>
            If you believe this is an error, please{' '}
            <a 
              href="mailto:support@example.com?subject=404 Error Report"
              className="text-primary hover:underline"
            >
              contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}