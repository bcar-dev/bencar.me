import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
    js.configs.recommended,
    ...tseslint.configs.recommended,
    prettierConfig,
    {
        files: ['src/**/*.{js,mjs,cjs,ts,tsx}'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                React: 'readonly',
                JSX: 'readonly',
                document: 'readonly',
                window: 'readonly',
                localStorage: 'readonly',
                console: 'readonly',
                URL: 'readonly',
                HTMLElement: 'readonly',
                setTimeout: 'readonly',
            },
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
        rules: {
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/no-explicit-any': 'warn',
        },
    },
    {
        files: ['src/**/__tests__/**/*.{js,mjs,cjs,ts,tsx}'],
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
        },
    },
    {
        ignores: ['.next/**', 'node_modules/**'],
    }
);
