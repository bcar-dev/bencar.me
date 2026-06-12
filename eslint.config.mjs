import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import vue from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';
import astro from 'eslint-plugin-astro';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
    js.configs.recommended,
    ...tseslint.configs.recommended,
    ...vue.configs['flat/recommended'],
    ...astro.configs.recommended,
    prettierConfig,
    {
        // Parse .vue with vue-eslint-parser and <script lang="ts"> with the TS parser.
        files: ['**/*.vue'],
        languageOptions: {
            parser: vueParser,
            parserOptions: {
                parser: tseslint.parser,
                sourceType: 'module',
                extraFileExtensions: ['.vue'],
            },
        },
    },
    {
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                document: 'readonly',
                window: 'readonly',
                localStorage: 'readonly',
                console: 'readonly',
                URL: 'readonly',
                URLSearchParams: 'readonly',
                HTMLElement: 'readonly',
                HTMLDivElement: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                requestAnimationFrame: 'readonly',
                FrameRequestCallback: 'readonly',
                MouseEvent: 'readonly',
                Event: 'readonly',
            },
        },
        rules: {
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/no-explicit-any': 'warn',
            // Single-word island names (Icon, Search, Tag) are intentional.
            'vue/multi-word-component-names': 'off',
            // v-html is only used to inline trusted, hardcoded SVG from src/lib/icons.ts.
            'vue/no-v-html': 'off',
        },
    },
    {
        // Node scripts and config files.
        files: ['scripts/**/*.{js,mjs}', '*.config.{js,mjs,ts}'],
        languageOptions: {
            globals: {
                process: 'readonly',
                console: 'readonly',
                URL: 'readonly',
            },
        },
    },
    {
        files: ['src/**/__tests__/**/*.{js,mjs,cjs,ts,tsx}', 'src/test/**/*.{ts,tsx}'],
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
        },
    },
    {
        ignores: ['dist/**', 'node_modules/**', '.astro/**', 'coverage/**', 'public/pagefind/**'],
    }
);
