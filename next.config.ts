import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/api/aichat/:path*",
        destination: `${process.env.NEXT_PUBLIC_AICHAT_URL || "http://localhost:3010"}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
