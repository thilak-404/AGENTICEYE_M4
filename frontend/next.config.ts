import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: '/api/py/:path*',
        destination:
          process.env.NODE_ENV === 'development'
            ? 'http://127.0.0.1:8000/api/py/:path*'
            : (process.env.PYTHON_BACKEND_URL
              ? `${process.env.PYTHON_BACKEND_URL}/api/py/:path*`
              : 'http://127.0.0.1:8000/api/py/:path*'),
      },
    ];
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts", "framer-motion"],
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        { key: "X-DNS-Prefetch-Control", value: "on" },
        { key: "Cache-Control", value: "public, max-age=3600, must-revalidate" }
      ]
    }
  ]
};

export default nextConfig;
