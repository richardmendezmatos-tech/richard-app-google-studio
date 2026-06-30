import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    {
        ignores: [
            'dist',
            'node_modules',
            '.agents/**',
            '.agent/**',
            'debug_*.js',
            'stats.html',
            'playwright-report',
            'test-results',
            'android',
            'ios',
            'tools',
            'vite-env.d.ts',
            'public/sitemap.xml',
            '.next'
        ]
    },
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
    // ── Feature-Sliced Design: enforcement de dirección de capas ──
    // Dirección permitida (solo hacia abajo): app → views → widgets → features → entities → shared
    // Una capa no puede importar de las capas que están por encima de ella.
    // `allowTypeImports: true` permite type-imports cruzados (se borran en runtime, no acoplan).
    {
        files: ['src/shared/**/*.{ts,tsx}'],
        rules: {
            'no-restricted-imports': 'off',
            '@typescript-eslint/no-restricted-imports': ['error', {
                patterns: [{
                    group: ['@/entities/*', '@/features/*', '@/widgets/*', '@/views/*', '@/app/*', '@app/*'],
                    message: 'FSD: shared es la capa base y no puede importar de capas superiores. Bajá el tipo/util a shared o usá `import type`.',
                    allowTypeImports: true,
                }],
            }],
        },
    },
    {
        files: ['src/entities/**/*.{ts,tsx}'],
        rules: {
            'no-restricted-imports': 'off',
            '@typescript-eslint/no-restricted-imports': ['error', {
                patterns: [{
                    group: ['@/features/*', '@/widgets/*', '@/views/*', '@/app/*', '@app/*'],
                    message: 'FSD: entities solo puede importar de shared (no de features/widgets/views/app).',
                    allowTypeImports: true,
                }],
            }],
        },
    },
    {
        files: ['src/features/**/*.{ts,tsx}'],
        rules: {
            'no-restricted-imports': 'off',
            '@typescript-eslint/no-restricted-imports': ['error', {
                patterns: [{
                    group: ['@/widgets/*', '@/views/*', '@/app/*', '@app/*'],
                    message: 'FSD: features solo puede importar de entities y shared (no de widgets/views/app).',
                    allowTypeImports: true,
                }],
            }],
        },
    },
    {
        files: ['src/widgets/**/*.{ts,tsx}'],
        rules: {
            'no-restricted-imports': 'off',
            '@typescript-eslint/no-restricted-imports': ['error', {
                patterns: [{
                    group: ['@/views/*', '@/app/*', '@app/*'],
                    message: 'FSD: widgets no puede importar de views ni app.',
                    allowTypeImports: true,
                }],
            }],
        },
    },
    {
        files: ['src/views/**/*.{ts,tsx}'],
        rules: {
            'no-restricted-imports': 'off',
            '@typescript-eslint/no-restricted-imports': ['error', {
                patterns: [{
                    group: ['@/app/*', '@app/*'],
                    message: 'FSD: views no puede importar de app (las pages de app importan views, no al revés).',
                    allowTypeImports: true,
                }],
            }],
        },
    },
);
