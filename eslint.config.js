import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    { ignores: ['dist', 'debug_*.js', 'stats.html', 'playwright-report', 'test-results', 'android', 'ios', 'tools', 'vite-env.d.ts'] },
    {
        extends: [js.configs.recommended, ...tseslint.configs.recommended],
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
        },
        plugins: {
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            'react-refresh/only-export-components': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
        },
    },
    {
        files: ['src/services/**/*.{ts,tsx}'],
        rules: {
            'no-restricted-imports': ['error', {
                patterns: ['@/features/*']
            }]
        }
    },
    {
        files: ['src/infra/**/*.{ts,tsx}'],
        rules: {
            'no-restricted-imports': ['error', {
                patterns: ['@/components/*', '@/features/*']
            }]
        }
    },
);
