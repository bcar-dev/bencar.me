import { defineConfig, fontProviders } from 'astro/config';
import vue from '@astrojs/vue';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import Icons from 'unplugin-icons/vite';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { unified } from '@astrojs/markdown-remark';
import { fileURLToPath } from 'node:url';

import { siteConfig } from './src/config/site.ts';
import { rehypeImageRatio } from './src/lib/rehypeImageRatio.ts';

/** Build the Pagefind search index into the final output dir after the build. */
function pagefindIntegration() {
    return {
        name: 'pagefind-index',
        hooks: {
            'astro:build:done': async ({ dir, logger }) => {
                const { buildSearchIndex } = await import('./scripts/build-search-index.mjs');
                const outputDir = fileURLToPath(new URL('pagefind/', dir));
                const { count } = await buildSearchIndex(outputDir);
                logger.info(`Indexed ${count} posts -> dist/pagefind`);
            },
        },
    };
}

// https://astro.build/config
export default defineConfig({
    site: siteConfig.url,
    prefetch: {
        prefetchAll: true,
        defaultStrategy: 'hover',
    },
    integrations: [vue(), pagefindIntegration(), sitemap()],
    fonts: [
        {
            provider: fontProviders.google(),
            name: 'DM Sans',
            cssVariable: '--font-dm-sans',
            weights: ['400 700'],
            styles: ['normal', 'italic'],
            fallbacks: ['sans-serif'],
        },
        {
            provider: fontProviders.google(),
            name: 'Source Serif 4',
            cssVariable: '--font-source-serif',
            weights: ['400 700'],
            styles: ['normal', 'italic'],
            fallbacks: ['serif'],
        },
    ],
    vite: {
        plugins: [tailwindcss(), Icons({ compiler: 'vue3' })],
    },
    markdown: {
        // Astro 6 takes a unified() processor; declare GFM + smartypants on it
        // (Astro deprecates the top-level markdown.gfm/smartypants when a processor
        // is set) and add rehype plugins for heading slug ids + anchor links, and
        // each body image's aspect ratio (used by markdown.css to cap its height).
        processor: unified({
            gfm: true,
            smartypants: true,
            rehypePlugins: [
                rehypeImageRatio,
                rehypeSlug,
                [
                    rehypeAutolinkHeadings,
                    {
                        behavior: 'append',
                        properties: {
                            className: ['heading-anchor'],
                            'aria-label': 'Link to section',
                        },
                        content: { type: 'text', value: '#' },
                    },
                ],
            ],
        }),
    },
});
