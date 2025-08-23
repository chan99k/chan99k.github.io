'use client';

import { Certification } from '@/types';
import { Award, Calendar, ExternalLink } from 'lucide-react';

interface CertificationsSectionProps {
  certifications: Certification[];
}

export function CertificationsSection({
  certifications,
}: CertificationsSectionProps) {
  return (
    <section className='mb-16'>
      <div className='mb-8'>
        <h2 className='text-3xl font-bold text-foreground mb-4'>
          Certifications
        </h2>
        <p className='text-muted-foreground'>
          Professional certifications and achievements
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {certifications.map(cert => (
          <div
            key={cert.id}
            className='bg-card rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300 border'
          >
            {/* Certification Header */}
            <div className='flex items-start space-x-3 mb-4'>
              <Award className='w-6 h-6 text-primary mt-1 flex-shrink-0' />
              <div className='flex-1'>
                <h3 className='text-lg font-semibold text-card-foreground mb-1'>
                  {cert.name}
                </h3>
                <p className='text-muted-foreground font-medium'>
                  {cert.issuer}
                </p>
              </div>

              {/* External Link */}
              {cert.url && (
                <a
                  href={cert.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-muted-foreground hover:text-foreground transition-colors'
                  aria-label={`View ${cert.name} certificate`}
                >
                  <ExternalLink className='w-5 h-5' />
                </a>
              )}
            </div>

            {/* Certification Details */}
            <div className='space-y-2 text-sm text-muted-foreground'>
              <div className='flex items-center space-x-2'>
                <Calendar className='w-4 h-4' />
                <span>Issued: {cert.date}</span>
              </div>

              {cert.credentialId && (
                <div className='pt-2 border-t border-border'>
                  <p className='text-xs text-muted-foreground'>
                    <span className='font-medium'>Credential ID:</span>{' '}
                    {cert.credentialId}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
