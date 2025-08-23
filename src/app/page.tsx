import { SITE_CONFIG } from '@/lib/constants';
import Link from 'next/link';

export default function Home() {
  return (
    <div className='container mx-auto px-4 py-12 sm:py-16 lg:py-20'>
      <div className='max-w-4xl mx-auto text-center'>
        <h1 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight'>
          Welcome to{' '}
          <span className='text-blue-600 dark:text-blue-400 block sm:inline'>
            {SITE_CONFIG.name}
          </span>
        </h1>

        <p className='text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed'>
          {SITE_CONFIG.description}
        </p>

        <div className='flex flex-col xs:flex-row gap-3 sm:gap-4 justify-center items-center max-w-md mx-auto'>
          <Link
            href='/portfolio'
            className='w-full xs:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors text-center'
          >
            View Portfolio
          </Link>
          <Link
            href='/blog'
            className='w-full xs:w-auto border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 px-6 py-3 rounded-lg font-medium transition-colors text-center'
          >
            Read Blog
          </Link>
        </div>
      </div>
    </div>
  );
}