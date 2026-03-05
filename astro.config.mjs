import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import remarkCjkFriendly from 'remark-cjk-friendly';

const isDev = process.env.NODE_ENV === 'development';

// https://astro.build/config
export default defineConfig({
    site: 'https://chan99k.github.io',
    markdown: {
        remarkPlugins: [remarkCjkFriendly],
    },
    vite: {
        plugins: [tailwindcss()],
    },
    integrations: [react(), sitemap()],
    adapter: isDev ? undefined : netlify()
});
