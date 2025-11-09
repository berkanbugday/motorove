/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Enable server-side rendering
  output: 'standalone',
  // Optimize for production
  poweredByHeader: false,
  compress: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  transpilePackages: ['@motorove/shared', 'date-fns'],
  // Enable experimental features for better SSR
  experimental: {
    optimizePackageImports: ['framer-motion'],
    esmExternals: 'loose',
  },
  webpack: (config) => {
    // Allow date-fns to be imported as ESM even when required by CommonJS
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.tsx'],
    };
    return config;
  },
};

module.exports = nextConfig;
