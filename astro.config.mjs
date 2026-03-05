import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import remarkCjkFriendly from 'remark-cjk-friendly';

const isDev = process.env.NODE_ENV === 'development';

// https://astro.build/config
export default defineConfig({
    markdown: {
        remarkPlugins: [remarkCjkFriendly],
    },
    vite: {
        plugins: [tailwindcss()],
    },
    integrations: [react()],
    adapter: isDev ? undefined : netlify()
});
