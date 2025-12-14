/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@interview/ui', '@interview/utils', '@interview/config', '@interview/types'],
  experimental: {
    appDir: true,
  },
}

module.exports = nextConfig