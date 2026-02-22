
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import viteCompression from 'vite-plugin-compression';
import { visualizer } from 'rollup-plugin-visualizer';
// import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiKey = env.VITE_FIREBASE_API_KEY || env.API_KEY || "";

  const suppressFirebaseMixedImportWarning = (warning: any, warn: any) => {
    if (
      warning.code === 'PLUGIN_WARNING' &&
      warning.message.includes('is dynamically imported by') &&
      warning.message.includes('but also statically imported by')
    ) {
      return;
    }
    warn(warning);
  };

  return {
    server: {
      host: true,
    },
    build: {
      target: 'es2022',
      sourcemap: true,
      rollupOptions: {
        onwarn: suppressFirebaseMixedImportWarning,
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-framer': ['framer-motion'],
            'vendor-ui-icons': ['lucide-react'],
            'vendor-firebase-auth': ['firebase/auth'],
            'vendor-firebase-db': ['firebase/firestore/lite', 'firebase/firestore'],
            'vendor-ai': ['@google/generative-ai'],
            'vendor-utils': ['@reduxjs/toolkit', 'react-redux', 'rxjs']
          }
        }
      },
      chunkSizeWarningLimit: 1000, // Reduced from 1500
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      }
    },
    define: {
      'process.env.API_KEY': JSON.stringify(apiKey),
      'global': 'globalThis',
    },
    test: {
      environment: 'jsdom',
      setupFiles: ['./vitest.setup.ts'],
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
      exclude: ['e2e/**', 'node_modules/**', 'dist/**']
    },
    plugins: [
      react(),
      nodePolyfills({
        globals: {
          Buffer: true,
          global: true,
          process: true,
        },
      }),
      viteCompression({ algorithm: 'gzip', ext: '.gz' }),

      visualizer({ filename: 'stats.html' }),
      VitePWA({
        strategies: 'injectManifest',
        srcDir: 'src',
        filename: 'sw.js',
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg', 'app-icon.png'],
        injectManifest: {
          minify: 'esbuild',
          sourcemap: false,
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        },
        manifest: {
          name: 'Richard Automotive',
          short_name: 'RichardAuto',
          display: 'standalone',
          theme_color: '#00aed9',
          background_color: '#0f172a',
          description: 'Premium Automotive Sales & Predictive Service OS',
          icons: [
            {
              src: 'app-icon.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'app-icon.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: 'app-icon.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            }
          ]
        }
      })
    ]
  }
})
