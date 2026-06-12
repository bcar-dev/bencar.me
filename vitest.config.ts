/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';

// getViteConfig wires up Astro's pipeline (Vue integration, content collections,
// astro:assets, import.meta.glob) so tests can import both .astro and .vue files.
export default getViteConfig({
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/test/setup.ts'],
        include: ['src/**/*.{test,spec}.{ts,tsx}'],
        coverage: {
            provider: 'v8',
            include: ['src/**/*.{ts,vue}'],
            exclude: [
                'src/**/*.{test,spec}.{ts,tsx}',
                'src/**/__tests__/**',
                'src/test/**',
                'src/types/**',
                'src/content.config.ts',
                'src/env.d.ts',
                // Browser-only Pagefind loader: a native dynamic import of a public
                // asset that can't run under jsdom (Search.vue's behavior is tested
                // with this module mocked).
                'src/lib/pagefind.ts',
            ],
            reporter: ['text', 'text-summary'],
            // 100% lines + functions. Statements/branches sit just below 100 due to
            // defensive race guards in Search and Vue-compiler-generated template
            // branches that v8 miscounts (and /* v8 ignore */ doesn't work in .vue).
            thresholds: { lines: 100, functions: 100, statements: 95, branches: 90 },
        },
    },
});
