import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=*",
  },
];

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
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
  async redirects() {
    return [
      // Legacy URL: Membership application form (/joining → /apply)
      {
        source: "/joining",
        destination: "/apply",
        permanent: true,
      },
      // Legacy URL: Contact page (/contact → /contact-us)
      {
        source: "/contact",
        destination: "/contact-us",
        permanent: true,
      },
      // Legacy URL: Human rights protection / members page (/welcome/members → /apply)
      {
        source: "/welcome/members",
        destination: "/apply",
        permanent: true,
      },
      // Catch-all for /welcome/* paths that may also be indexed
      {
        source: "/welcome/:path*",
        destination: "/",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ["pdfkit"],
};

export default nextConfig;

