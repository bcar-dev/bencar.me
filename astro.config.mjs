import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import Icons from 'unplugin-icons/vite';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { unified } from '@astrojs/markdown-remark';
import { fileURLToPath } from 'node:url';

import { siteConfig } from './src/config/site.ts';

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
    vite: {
        plugins: [tailwindcss(), Icons({ compiler: 'vue3' })],
    },
    markdown: {
        // Astro 6 takes a unified() processor; declare GFM + smartypants on it
        // (Astro deprecates the top-level markdown.gfm/smartypants when a processor
        // is set) and add rehype plugins for heading slug ids + anchor links.
        processor: unified({
            gfm: true,
            smartypants: true,
            rehypePlugins: [
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
