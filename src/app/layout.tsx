import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';

import './globals.css';
import { SITE_CONFIG } from '@/lib/constants';
import { MainLayout } from '@/components/layout';
import { generateSEOMetadata, generateWebsiteJsonLd } from '@/lib/seo';


const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = generateSEOMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const websiteJsonLd = generateWebsiteJsonLd();

  return (
    <html lang='en' suppressHydrationWarning>
      <head>
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd),
          }}
        />
        <link
          rel='alternate'
          type='application/rss+xml'
          title={`${SITE_CONFIG.name} RSS Feed`}
          href='/rss.xml'
        />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}
