import type { NextConfig } from "next";

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "leprive.com.pl",
        port: "",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
