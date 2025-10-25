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

      // Ensure reflect-metadata is loaded before any decorators
      // This is required for class-validator and class-transformer decorators
      // to work in the browser (they use Reflect.getMetadata)
      if (!config.entry) {
        config.entry = {};
      }
      
      const originalEntry = config.entry;
      config.entry = async () => {
        const entries = await (typeof originalEntry === 'function' ? originalEntry() : originalEntry);
        
        // Add reflect-metadata to the main entry point
        if (entries['main-app'] && !entries['main-app'].includes('reflect-metadata')) {
          if (Array.isArray(entries['main-app'])) {
            entries['main-app'].unshift('reflect-metadata');
          }
        }
        
        return entries;
      };
    }
    return config;
  },
}

export default nextConfig
