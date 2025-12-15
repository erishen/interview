/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@interview/ui', '@interview/utils', '@interview/config', '@interview/types'],
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: require('path').join(__dirname, '../../'),
  },
  compiler: {
    styledComponents: true,
  },
}

module.exports = nextConfig