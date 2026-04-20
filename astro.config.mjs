import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import netlify from '@astrojs/netlify';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import remarkCjkFriendly from 'remark-cjk-friendly';
import expressiveCode from 'astro-expressive-code';

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
    integrations: [
        expressiveCode({
            themes: ['github-light', 'github-dark'],
            styleOverrides: {
                codeFontFamily: 'var(--font-mono, ui-monospace, monospace)',
                uiFontFamily: 'var(--font-sans, system-ui, sans-serif)',
            },
        }),
        mdx(),
        react(),
        sitemap(),
    ],
    adapter: isDev ? undefined : netlify()
});
