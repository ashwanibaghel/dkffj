import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "100mb",
    },
  },
  images: {
    minimumCacheTTL: 31536000, // 1 year caching
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tgszzjbvpcznndrfkkov.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ["pdfkit"],
};

export default nextConfig;
