/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['picsum.photos'],
  },
  transpilePackages: ['@motorove/shared'],
};

module.exports = nextConfig;
