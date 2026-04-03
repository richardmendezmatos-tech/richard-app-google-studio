/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    'lucide-react',
    'motion',
    'framer-motion',
    'canvas-confetti'
  ],
  experimental: {
    ppr: true,
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      'recharts',
      '@headlessui/react',
      'lucide-react'
    ]
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  webpack: (config) => {
    // Explicit alias resolution for FSD
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': './src'
    };
    return config;
  },
};

export default nextConfig;
