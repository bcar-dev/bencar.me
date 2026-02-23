/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    define: {
        'process.env': {},
    },
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/test/setup.ts'],
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
        exclude: [
            '**/node_modules/**',
            '**/dist/**',
            '**/cypress/**',
            '**/.{idea,git,cache,output,temp}/**',
            '**/{karma,rollup,webpack,vite,vitest}.config.*',
            // Exclude node-specific tests from browser mode
            ...(process.argv.some((arg) => arg.includes('browser'))
                ? ['src/lib/__tests__/**']
                : []),
            // Exclude browser-specific tests from default mode
            ...(!process.argv.some((arg) => arg.includes('browser'))
                ? ['src/test/browser.test.tsx']
                : []),
        ],
        browser: {
            enabled: process.argv.some((arg) => arg.includes('browser')),
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
            headless: true,
        },
    },
});
