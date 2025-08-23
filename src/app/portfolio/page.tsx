import { Metadata } from 'next';
import { generatePortfolioMetadata } from '@/lib/seo';

export const metadata: Metadata = generatePortfolioMetadata();

export default function Portfolio() {
  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='max-w-4xl mx-auto'>
        <div className='mb-8'>
          <h1 className='text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4'>
            Portfolio
          </h1>
          <p className='text-lg text-gray-600 dark:text-gray-400'>
            Software developer with experience in full-stack development and problem-solving.
          </p>
        </div>

        <div className='space-y-8'>
          <section>
            <h2 className='text-2xl font-semibold mb-4'>Experience</h2>
            <div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-6'>
              <h3 className='text-xl font-semibold mb-2'>Software Developer</h3>
              <p className='text-gray-600 dark:text-gray-400 mb-2'>Company Name • 2020 - Present</p>
              <p className='text-gray-700 dark:text-gray-300'>
                Developed and maintained web applications using modern technologies.
              </p>
            </div>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-4'>Projects</h2>
            <div className='grid gap-6 md:grid-cols-2'>
              <div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-6'>
                <h3 className='text-xl font-semibold mb-2'>Project 1</h3>
                <p className='text-gray-600 dark:text-gray-400 mb-4'>
                  Description of the first project and its key features.
                </p>
                <div className='flex flex-wrap gap-2'>
                  <span className='px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm'>
                    React
                  </span>
                  <span className='px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm'>
                    TypeScript
                  </span>
                </div>
              </div>

              <div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-6'>
                <h3 className='text-xl font-semibold mb-2'>Project 2</h3>
                <p className='text-gray-600 dark:text-gray-400 mb-4'>
                  Description of the second project and its key features.
                </p>
                <div className='flex flex-wrap gap-2'>
                  <span className='px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-sm'>
                    Node.js
                  </span>
                  <span className='px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-sm'>
                    Express
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
