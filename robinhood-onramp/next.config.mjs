/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't bundle server-only modules in client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        child_process: false,
        fs: false,
      };
    }
    return config;
  },
}

export default nextConfig
