import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import remarkCjkFriendly from 'remark-cjk-friendly';

const isDev = process.env.NODE_ENV === 'development';

// https://astro.build/config
export default defineConfig({
    site: 'https://blog.chan99k.dev',
    markdown: {
        remarkPlugins: [remarkCjkFriendly],
    },
    vite: {
        plugins: [tailwindcss()],
        optimizeDeps: {
            exclude: ['onnxruntime-node'],
        },
        build: {
            rollupOptions: {
                external: ['onnxruntime-node'],
            },
        },
    },
    integrations: [react(), sitemap()],
    adapter: isDev ? undefined : netlify()
});
