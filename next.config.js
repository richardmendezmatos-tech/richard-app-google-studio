/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    // Next.js Image Optimization
    remotePatterns: [
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'api-java-gcp.richard-automotive.com' },
      { protocol: 'https', hostname: 'randomuser.me' },
    ],
  },
  cacheComponents: false,
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      'clsx',
      'tailwind-merge',
      '@tanstack/react-query',
      'date-fns',
      'recharts',
    ],
  },
  // outputFileTracingRoot removed for CI/CD compatibility
  
  // Turbopack configuration for Next.js 16+
  turbopack: {
    resolveAlias: {
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
