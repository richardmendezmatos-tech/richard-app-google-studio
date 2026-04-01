/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    'lucide-react',
    'motion',
    'framer-motion',
    'canvas-confetti'
  ],
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
