import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname:
          "firebasestorage.googleapis.com",
      },

      {
        protocol: "https",
        hostname: "cf.shopee.co.id",
      },
    ],
  },

  webpack: (config) => {
    config.externals.push({
      pdfkit: "commonjs pdfkit",
    });

    return config;
  },
};

export default nextConfig;