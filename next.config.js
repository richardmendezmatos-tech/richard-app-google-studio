import withPWAInit from 'next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Forzar reinicio del servidor para aplicar cambios en componentes
  cacheComponents: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'api-java-gcp.richard-automotive.com' },
      { protocol: 'https', hostname: 'randomuser.me' },
      { protocol: 'https', hostname: 'apicdn.inventario360.com' },
    ],
  },
  transpilePackages: [
    'lucide-react',
    'motion',
    'framer-motion',
    'canvas-confetti'
  ],
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      'clsx',
      'tailwind-merge',
      '@tanstack/react-query',
      'date-fns',
      'recharts',
      '@headlessui/react',
    ],
  },
  
  turbopack: {
    root: process.cwd(),
    resolveAlias: {
      '@': './src',
      '@/shared': './src/shared',
      '@/entities': './src/entities',
      '@/features': './src/features',
      '@/widgets': './src/widgets',
      '@/pages': './src/views',
      '@/processes': './src/processes',
    },
  },

  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': './src',
      '@/shared': './src/shared',
      '@/entities': './src/entities',
      '@/features': './src/features',
      '@/widgets': './src/widgets',
      '@/pages': './src/views',
      '@/processes': './src/processes',
    };
    return config;
  },
  
  // ─── Edge Layer Optimization (Antigravity Sentinel) ────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Antigravity-Edge', value: 'enabled' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)',
          },
        ],
      },
      {
        source: '/assets/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, stale-while-revalidate=86400, immutable',
          },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=3600',
          },
        ],
      },
    ];
  },
};

export default withPWA(nextConfig);
