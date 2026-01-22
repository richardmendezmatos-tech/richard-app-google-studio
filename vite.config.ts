import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue';
import react from '@vitejs/plugin-react'
import viteAngular from '@analogjs/vite-plugin-angular';
import { VitePWA } from 'vite-plugin-pwa'
import viteCompression from 'vite-plugin-compression';
import eslint from 'vite-plugin-eslint';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiKey = env.VITE_FIREBASE_API_KEY || env.API_KEY || "";

  return {
    server: {
      host: true, // Expone a la red local (0.0.0.0)
    },
    build: {
      target: 'es2022',
      rollupOptions: {
        output: {
          // Automatic chunking by Vite/Rollup
        }
      }
    },
    plugins: [
      react(),
      vue(),
      // Guarded Analog Plugin: Prevents interference with React/JSX files
      (() => {
        const p = viteAngular({ tsconfig: 'tsconfig.json' });
        const wrap = (x: any) => ({
          ...x,
          transform(code: string, id: string) {
            if (id.includes('.tsx') || id.includes('.jsx')) return null;
            if (typeof x.transform === 'function') {
              return x.transform.call(this, code, id);
            }
            return null;
          }
        });
        return Array.isArray(p) ? p.map(wrap) : wrap(p);
      })(),
      /* eslint({
        cache: true,
        fix: true,
        include: ['./**\/*.{js,jsx,ts,tsx}'],
        exclude: [/node_modules/],
      }), */
      viteCompression({ algorithm: 'gzip', ext: '.gz' }),
      visualizer({ filename: 'stats.html' }),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/firebasestorage\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'firebase-storage-images',
                expiration: {
                  maxEntries: 60,
                  maxAgeSeconds: 30 * 24 * 60 * 60,
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: /^https:\/\/i\.postimg\.cc\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'external-images',
                expiration: {
                  maxEntries: 30,
                  maxAgeSeconds: 30 * 24 * 60 * 60,
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            }
          ]
        },
        manifest: {
          name: 'Richard Automotive',
          short_name: 'RichardAuto',
          description: 'Inventario Premium de Autos en Puerto Rico',
          theme_color: '#00aed9',
          background_color: '#0f172a',
          display: 'standalone',
          start_url: '/',
          lang: 'es-PR',
          orientation: 'portrait',
          icons: [
            {
              src: 'app-icon.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'app-icon.png',
              sizes: '512x512',
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
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(apiKey)
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './vitest.setup.ts',
    }
  }
})
