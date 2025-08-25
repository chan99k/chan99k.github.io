/**
 * Blog PWA Features Component
 * Client component for PWA features on the blog page
 */

'use client';

import React from 'react';
import { OfflineContentManager, NotificationSettings } from '@/components/pwa';

interface BlogPWAFeaturesProps {
  blogPosts: Array<{
    slug: string;
    title: string;
    url: string;
  }>;
}

export function BlogPWAFeatures({ blogPosts }: BlogPWAFeaturesProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <OfflineContentManager 
          className="flex-1"
          blogPosts={blogPosts}
        />
        <NotificationSettings 
          className="flex-1"
          showTestButton={process.env.NODE_ENV === 'development'}
        />
      </div>
    </div>
  );
}