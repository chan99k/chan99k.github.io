'use client';

import { PersonalInfo } from '@/types';
import { Github, Mail } from 'lucide-react';

interface PersonalInfoSectionProps {
  personalInfo: PersonalInfo;
}

export function PersonalInfoSection({
  personalInfo,
}: PersonalInfoSectionProps) {
  return (
    <section className='mb-16'>
      <div className='text-center mb-8'>
        <h1 className='text-4xl md:text-5xl font-bold text-foreground mb-4'>
          {personalInfo.name}
        </h1>
        <h2 className='text-xl md:text-2xl text-muted-foreground mb-6'>
          {personalInfo.title}
        </h2>

        {/* Contact Links */}
        <div className='flex justify-center space-x-6 mb-8'>
          <a
            href={`mailto:${personalInfo.email}`}
            className='flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors'
            aria-label={`Email ${personalInfo.name}`}
          >
            <Mail className='w-5 h-5' />
            <span className='hidden sm:inline'>{personalInfo.email}</span>
          </a>

          <a
            href={personalInfo.github}
            target='_blank'
            rel='noopener noreferrer'
            className='flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors'
            aria-label={`${personalInfo.name}'s GitHub profile`}
          >
            <Github className='w-5 h-5' />
            <span className='hidden sm:inline'>GitHub</span>
          </a>
        </div>
      </div>

      {/* Summary */}
      <div className='max-w-3xl mx-auto'>
        <div className='bg-muted rounded-lg p-6 md:p-8'>
          <h3 className='text-lg font-semibold text-foreground mb-4'>
            About Me
          </h3>
          <p className='text-muted-foreground leading-relaxed'>
            {personalInfo.summary}
          </p>
        </div>
      </div>
    </section>
  );
}
