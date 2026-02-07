
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import viteCompression from 'vite-plugin-compression';
import { visualizer } from 'rollup-plugin-visualizer';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiKey = env.VITE_FIREBASE_API_KEY || env.API_KEY || "";

  return {
    server: {
      host: true,
    },
    build: {
      target: 'es2022',
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            // Core React libraries
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],

            // Heavy 3D libraries (Digital Twin)
            'vendor-three': ['three', '@react-three/fiber', '@react-three/drei'],

            // Firebase
            'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],

            // AI/ML libraries
            'vendor-ai': ['@google/generative-ai', '@mediapipe/tasks-vision'],

            // Code Sandbox (AI Lab)
            'vendor-sandpack': ['@codesandbox/sandpack-react', '@codesandbox/sandpack-themes'],

            // UI libraries
            'vendor-ui': ['framer-motion', 'lucide-react', '@dnd-kit/core', '@dnd-kit/sortable'],

            // Redux
            'vendor-redux': ['@reduxjs/toolkit', 'react-redux', 'rxjs']
          }
        }
      },
      chunkSizeWarningLimit: 1000, // Reduced from 1500
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        'node:child_process': path.resolve(__dirname, './src/shims-node.ts'),
        'node:net': path.resolve(__dirname, './src/shims-node.ts'),
        'child_process': path.resolve(__dirname, './src/shims-node.ts'),
        'net': path.resolve(__dirname, './src/shims-node.ts'),
      }
    },
    define: {
      'process.env.API_KEY': JSON.stringify(apiKey),
      'global': 'globalThis',
    },
    plugins: [
      react(),
      nodePolyfills({
        // Disable the specific polyfills that are conflicting with our custom shims
        exclude: ['child_process', 'net'],
        globals: {
          Buffer: true,
          global: true,
          process: true,
        },
      }),
      viteCompression({ algorithm: 'gzip', ext: '.gz' }),
      /* ViteImageOptimizer({
        png: { quality: 80 },
        jpeg: { quality: 80 },
        jpg: { quality: 80 },
        webp: { lossless: true },
        exclude: ['hero.jpg', 'hero.avif'], // Corrupted file causing build errors
      }), */
      visualizer({ filename: 'stats.html' }),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg', 'app-icon.png'],
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'unsplash-images',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: /^https:\/\/firebasestorage\.googleapis\.com\/.*/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'firebase-storage',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
                }
              }
            },
            {
              urlPattern: ({ url }) => url.origin === self.location.origin && url.pathname.startsWith('/api/'),
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                networkTimeoutSeconds: 5,
                expiration: {
                  maxEntries: 20
                },
                backgroundSync: {
                  name: 'api-sync',
                  options: {
                    maxRetentionTime: 60 * 24 // 24 hours
                  }
                }
              }
            }
          ]
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
