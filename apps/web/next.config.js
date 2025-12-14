/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    transpilePackages: ["@interview/ui", "@interview/utils", "@interview/config", "@interview/types"],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;