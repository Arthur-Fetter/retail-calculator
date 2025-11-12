import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    databaseURL: process.env.DATABASE_URL,
    databaseDirectUrl: process.env.DIRECT_URL,
  }
};

export default nextConfig;
