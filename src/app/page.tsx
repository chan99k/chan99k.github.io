import { SITE_CONFIG } from '@/lib/constants';

export default function Home() {
  return (
    <div className='container mx-auto px-4 py-16'>
      <div className='max-w-4xl mx-auto text-center'>
        <h1 className='text-4xl md:text-6xl font-bold mb-6'>
          Welcome to {SITE_CONFIG.name}
        </h1>
        <p className='text-xl md:text-2xl text-muted-foreground mb-8'>
          {SITE_CONFIG.description}
        </p>
        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          <a
            href='/portfolio'
            className='inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-6 py-3 text-sm font-medium transition-colors hover:bg-primary/90'
          >
            View Portfolio
          </a>
          <a
            href='/blog'
            className='inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground'
          >
            Read Blog
          </a>
        </div>
      </div>
    </div>
  );
}
