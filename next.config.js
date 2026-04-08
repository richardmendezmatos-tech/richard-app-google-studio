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
      'motion/react',
      'framer-motion',
      'clsx',
      'tailwind-merge',
      '@tanstack/react-query',
      'date-fns',
      'recharts',
    ],
  },
  // Ensure the project root is correctly identified
  outputFileTracingRoot: '/Users/richardmendez/richard-automotive-_-command-center/',
  
  // Turbopack configuration for Next.js 16+
  // The 'turbopack' key is at the root level of the nextConfig object.
  turbopack: {
    resolveAlias: {
      '@/shared': './src/shared',
      '@/entities': './src/entities',
      '@/features': './src/features',
      '@/widgets': './src/widgets',
      '@/pages': './src/pages',
      '@/processes': './src/processes',
    },
  },

  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/shared': '/Users/richardmendez/richard-automotive-_-command-center/src/shared',
      '@/entities': '/Users/richardmendez/richard-automotive-_-command-center/src/entities',
      '@/features': '/Users/richardmendez/richard-automotive-_-command-center/src/features',
      '@/widgets': '/Users/richardmendez/richard-automotive-_-command-center/src/widgets',
      '@/pages': '/Users/richardmendez/richard-automotive-_-command-center/src/pages',
      '@/processes': '/Users/richardmendez/richard-automotive-_-command-center/src/processes',
    };
    return config;
  },
};

export default nextConfig;
