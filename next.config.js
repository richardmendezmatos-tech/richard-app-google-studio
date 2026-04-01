/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['lucide-react'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
    ],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/app': path.resolve(__dirname, 'src/_app-fsd'),
      '@app': path.resolve(__dirname, 'src/_app-fsd'),
      '@': path.resolve(__dirname, 'src'),
    };
    return config;
  },
  // Soporte para variables de entorno de Vite (VITE_*)
  env: {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.VITE_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.VITE_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.VITE_FIREBASE_APP_ID,
    // Vite-style aliases for client-side compatibility
    VITE_FIREBASE_API_KEY: process.env.VITE_FIREBASE_API_KEY,
    VITE_FIREBASE_AUTH_DOMAIN: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    VITE_FIREBASE_PROJECT_ID: process.env.VITE_FIREBASE_PROJECT_ID,
    VITE_FIREBASE_STORAGE_BUCKET: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    VITE_FIREBASE_MESSAGING_SENDER_ID: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    VITE_FIREBASE_APP_ID: process.env.VITE_FIREBASE_APP_ID,
    VITE_RECAPTCHA_KEY: process.env.VITE_RECAPTCHA_KEY,
    // Antigravity Copilot & Edge variables
    VITE_ANTIGRAVITY_EDGE_URL: process.env.VITE_ANTIGRAVITY_EDGE_URL || process.env.NEXT_PUBLIC_ANTIGRAVITY_EDGE_URL,
    VITE_ANTIGRAVITY_API_URL: process.env.VITE_ANTIGRAVITY_API_URL || process.env.NEXT_PUBLIC_ANTIGRAVITY_API_URL,
    VITE_ANTIGRAVITY_API_KEY: process.env.VITE_ANTIGRAVITY_API_KEY || process.env.NEXT_PUBLIC_ANTIGRAVITY_API_KEY,
  },
};

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default nextConfig;
