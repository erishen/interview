/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@interview/ui', '@interview/utils', '@interview/config', '@interview/types', '@interview/constants'],
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: require('path').join(__dirname, '../../'),
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  compiler: {
    styledComponents: true,
  },
}

const withNextIntl = require('next-intl/plugin')('./src/i18n/request.ts')

module.exports = withNextIntl(nextConfig)