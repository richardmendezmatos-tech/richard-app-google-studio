/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
};

export default nextConfig;
